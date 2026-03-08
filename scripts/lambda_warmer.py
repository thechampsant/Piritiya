#!/usr/bin/env python3
"""
Piritiya Lambda warmer: EventBridge rule that pings all 4 Lambdas every 5 minutes
to keep them warm and avoid cold start latency.

Usage:
  python scripts/lambda_warmer.py [--region us-east-1] [--account 288761728613]
  # Or with env: AWS_REGION, AWS_ACCOUNT_ID

Requires IAM: events:PutRule, events:PutTargets, events:DescribeRule,
  lambda:AddPermission, lambda:GetFunction (for ARN lookup).
"""
import argparse
import json
import os
import sys

try:
    import boto3
except ImportError:
    print("boto3 required: pip install boto3", file=sys.stderr)
    sys.exit(1)

RULE_NAME = "piritiya-lambda-warmer"
SCHEDULE_EXPRESSION = "rate(5 minutes)"
LAMBDA_NAMES = [
    "get-soil-moisture",
    "get-crop-advice",
    "get-market-prices",
    "get-govt-schemes",
]
# Minimal payload; Lambdas may return 4xx but stay warm
WARM_PAYLOAD = json.dumps({})


def main() -> None:
    parser = argparse.ArgumentParser(description="Create EventBridge rule to warm Piritiya Lambdas every 5 min")
    parser.add_argument("--region", default=os.environ.get("AWS_REGION", "us-east-1"), help="AWS region")
    parser.add_argument("--account", default=os.environ.get("AWS_ACCOUNT_ID", "288761728613"), help="AWS account ID")
    args = parser.parse_args()
    region = args.region
    account = args.account

    events = boto3.client("events", region_name=region)
    lambda_client = boto3.client("lambda", region_name=region)

    # Create or update the rule
    try:
        events.put_rule(
            Name=RULE_NAME,
            ScheduleExpression=SCHEDULE_EXPRESSION,
            State="ENABLED",
            Description="Warm Piritiya agent Lambdas every 5 minutes",
        )
        print(f"Rule {RULE_NAME} created/updated (schedule: {SCHEDULE_EXPRESSION})")
    except Exception as e:
        print(f"Failed to put rule: {e}", file=sys.stderr)
        sys.exit(1)

    targets = []
    for i, fn_name in enumerate(LAMBDA_NAMES):
        try:
            fn = lambda_client.get_function(FunctionName=fn_name)
            arn = fn["Configuration"]["FunctionArn"]
        except Exception as e:
            print(f"Warning: could not get ARN for {fn_name}: {e}", file=sys.stderr)
            continue

        # Allow EventBridge to invoke this Lambda
        try:
            lambda_client.add_permission(
                FunctionName=fn_name,
                StatementId=f"AllowEventBridge-{RULE_NAME}",
                Action="lambda:InvokeFunction",
                Principal="events.amazonaws.com",
                SourceArn=f"arn:aws:events:{region}:{account}:rule/{RULE_NAME}",
            )
            print(f"  Permission added for {fn_name}")
        except lambda_client.exceptions.ResourceConflictException:
            pass  # already exists

        targets.append({
            "Id": f"target-{fn_name}",
            "Arn": arn,
            "Input": WARM_PAYLOAD,
        })

    if not targets:
        print("No Lambda targets; exiting.", file=sys.stderr)
        sys.exit(1)

    try:
        events.put_targets(Rule=RULE_NAME, Targets=targets)
        print(f"Targets set: {[t['Id'] for t in targets]}")
    except Exception as e:
        print(f"Failed to put targets: {e}", file=sys.stderr)
        sys.exit(1)

    print("Done. Lambdas will be invoked every 5 minutes.")


if __name__ == "__main__":
    main()
