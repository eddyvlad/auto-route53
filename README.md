# Auto Route53

A dynamic DNS (DDNS) solution for AWS Lambda that updates Route53 DNS records based on external IP changes.

## Description

`auto-route53` is a serverless application that automatically updates DNS records for a domain in AWS Route 53 based on external IP address changes. It is ideal for maintaining dynamic DNS (DDNS) setups where your external IP may change frequently.

The application is written in TypeScript, uses AWS SDK v3, and is deployed on AWS Lambda.

## Features

- **Automated DNS Updates**: Automatically updates AWS Route 53 DNS records.
- **Auth Token Security**: Protects the API endpoint with an auth token to prevent unauthorized DNS manipulation.
  - Includes a built-in token generator for easy rotation of auth tokens.
- **TypeScript**: Fully written in TypeScript for type safety and maintainability.
- **Efficient Deployment**: Provides easy packaging and deployment to AWS Lambda using `npm run zip` and `npm run deploy`.
- **Auth Token Helper**: Easily create a secure auth token with `npm run generate-token`.
- **Unit Testing**: Includes unit tests written in Jest for maintaining code quality.

## Running on AWS Lambda

### Prerequisites

- [AWS Account](https://aws.amazon.com/account/)
- A domain managed in AWS Route 53
- Familiarity with:
  - Creating a Lambda function
  - Creating AWS API Gateway Resources & integrating them with a Lambda function
- Node.js (>=20.x.x)
- npm (>=10.x.x)

### Easy Deploy Prerequisites

To use `npm run deploy` for creating or updating the Lambda function, you will need the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions) configured with appropriate credentials.

Your AWS IAM account must also have the necessary permissions to deploy the Lambda function. Below is an example of the required policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:DeleteFunction"
      ],
      "Resource": "arn:aws:lambda:<region>:<account-id>:function:*"
    },
    {
      "Effect": "Allow",
      "Action": ["lambda:ListFunctions"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": "arn:aws:iam::<account-id>:role/<lambda-execution-role>"
    }
  ]
}
```

#### Note

The `lambda:CreateFunction` permission is only needed if you want this application to create the Lambda function for you. To create a function, you also need the following permissions to assign the execution role:

```json
{
  "Effect": "Allow",
  "Action": ["iam:CreateRole", "iam:AttachRolePolicy", "iam:GetRole", "iam:PassRole"],
  "Resource": "arn:aws:iam::<account-id>:role/*"
}
```

If this feels too permissive due to the wildcard `*`, you can narrow the scope to something like `arn:aws:iam::<account-id>:role/lambda-route53-execution-role`, ensuring that `lambda-route53-execution-role` matches the `LAMBDA_EXECUTION_ROLE_NAME` in the `.env` file.

### Installation

#### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/eddyvlad/auto-route53.git
   cd auto-route53
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the environment:

   ```bash
   cp .env.defaults .env
   ```

### Deployment

The project includes a streamlined packaging and deployment workflow. This creates a `.zip` package ready for AWS Lambda and deploys it using the AWS CLI.

1. **Package and Deploy**

   To zip the project and deploy it to AWS Lambda, run:

   ```bash
   npm run zip
   npm run deploy
   ```

   This process will:

- Build the project.
- Pack necessary files into `lambda-deployment.zip`, excluding dev dependencies and other unnecessary files.
- Deploy the package to AWS Lambda.
  - If no existing Lambda function is found, it creates one.
  - If the Lambda function already exists, it updates the function's code.

## Rationale

**Why is it overbuilt?**

This project may seem overbuilt, but it's intentional. It follows best practices for code quality, modularity, and developer experience (DevEx). The structure allows easy transferability to junior engineers, enabling multiple team members to work on the project concurrently.

The project includes automation scripts to simplify packaging, deployment, and auth token generation, ensuring that any team member can maintain it with minimal friction.

If you're curious about DevEx, [this article](https://github.blog/enterprise-software/collaboration/developer-experience-what-is-it-and-why-should-you-care/) offers an excellent overview.

**Why TypeScript?**

The choice of TypeScript aligns with my goals for code clarity, type safety, and scalability in team settings.

**Why both esbuild and ts-node?**

I'm experimenting with esbuild for faster builds, while ts-node is required for running `jest.config.ts`.

**Why not use esbuild for building?**

Esbuild requires an additional plugin for type checking during the build process. Since I am only using esbuild to run TypeScript files, I opted not to add this plugin for now.

## Known Issues

This project has been developed and tested on macOS 15 with Node.js v20.10.0. Compatibility with Windows or Linux has not been tested. Contributions to support multiple operating systems are welcome!
