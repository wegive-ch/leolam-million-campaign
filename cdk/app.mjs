#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(rootDir, "env.json");
const cloudFrontCommentSuffix = "static site";

class StaticSiteStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { siteConfig, assetPath } = props;
    const bucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: siteConfig.bucketName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      siteConfig.certificateArn,
    );

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      certificate,
      comment: `${siteConfig.stackName} ${cloudFrontCommentSuffix}`,
      defaultRootObject: "index.html",
      domainNames: [siteConfig.domain],
      enableIpv6: true,
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
        ttl: cdk.Duration.seconds(0),
      })),
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: parsePriceClass(siteConfig.priceClass),
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    const hostedZone = siteConfig.hostedZoneId
      ? route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
          hostedZoneId: siteConfig.hostedZoneId,
          zoneName: siteConfig.hostedZoneName,
        })
      : route53.HostedZone.fromLookup(this, "HostedZone", {
          domainName: siteConfig.hostedZoneName,
        });

    new route53.ARecord(this, "AliasRecordA", {
      zone: hostedZone,
      recordName: siteConfig.recordName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, "AliasRecordAAAA", {
      zone: hostedZone,
      recordName: siteConfig.recordName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset(assetPath)],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
      prune: true,
      cacheControl: [
        s3deploy.CacheControl.fromString("public,max-age=0,must-revalidate"),
      ],
    });

    new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "DistributionDomainName", { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, "SiteUrl", { value: `https://${siteConfig.domain}` });
  }
}

const envConfig = readJson(envPath);
const app = new cdk.App();
const siteConfig = normalizeConfig(envConfig);
const assetPath = resolve(rootDir, app.node.tryGetContext("assetPath") || siteConfig.outputDir || detectOutputDir());

new StaticSiteStack(app, siteConfig.stackName, {
  env: {
    account: siteConfig.account,
    region: siteConfig.region,
  },
  siteConfig,
  assetPath,
});

function normalizeConfig(rawConfig) {
  const domain = required(rawConfig.domain, "domain").replace(/\.$/, "");
  const hostedZoneName = (rawConfig.hostedZoneName || parentDomain(domain)).replace(/\.$/, "");
  const recordName = domain === hostedZoneName ? undefined : domain.slice(0, -(hostedZoneName.length + 1));
  const certificateArn = required(rawConfig.certificateArn, "certificateArn");

  if (!certificateArn.includes(":acm:us-east-1:")) {
    throw new Error("CloudFront requires certificateArn to reference an ACM certificate in us-east-1.");
  }

  return {
    account: required(rawConfig.account, "account"),
    region: required(rawConfig.region, "region"),
    certificateArn,
    domain,
    hostedZoneId: rawConfig.hostedZoneId,
    hostedZoneName,
    recordName,
    bucketName: rawConfig.bucketName || rawConfig.bucket || sanitizeBucketName(`${domain}-${rawConfig.account}`),
    stackName: rawConfig.stackName || `Lovable${toPascalCase(domain)}Stack`,
    outputDir: rawConfig.outputDir,
    priceClass: rawConfig.priceClass || "PRICE_CLASS_100",
  };
}

function detectOutputDir() {
  const candidates = [".output/public", "dist", "build", "out"];
  const found = candidates
    .map((candidate) => resolve(rootDir, candidate))
    .find((candidate) => existsSync(join(candidate, "index.html")) && statSync(candidate).isDirectory());

  if (!found) {
    throw new Error(`Could not find build output. Tried: ${candidates.join(", ")}`);
  }

  return found;
}

function parsePriceClass(value) {
  const normalized = String(value).toUpperCase().replace(/^PRICECLASS_/, "PRICE_CLASS_");
  const priceClass = cloudfront.PriceClass[normalized];

  if (!priceClass) {
    throw new Error(`Unsupported CloudFront priceClass: ${value}`);
  }

  return priceClass;
}

function parentDomain(domain) {
  const parts = domain.split(".");
  if (parts.length < 3) {
    return domain;
  }
  return parts.slice(1).join(".");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function required(value, name) {
  if (!value) {
    throw new Error(`Missing required env.json field: ${name}`);
  }
  return String(value);
}

function sanitizeBucketName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
}

function toPascalCase(value) {
  return String(value)
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}
