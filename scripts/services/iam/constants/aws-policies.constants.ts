export const AWS_MANAGED_POLICIES = {
  LAMBDA_BASIC_EXECUTION_ROLE: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
  ROUTE53_FULL_ACCESS: 'arn:aws:iam::aws:policy/AmazonRoute53FullAccess',
};

export const LAMBDA_TRUST_POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: {
        Service: 'lambda.amazonaws.com',
      },
      Action: 'sts:AssumeRole',
    },
  ],
};
