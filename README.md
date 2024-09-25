# Auto Route53

A dynamic DNS (DDNS) implementation for AWS Lambda that updates Route53 DNS records based on external IP changes.

## Description

`auto-route53` is a serverless application that automatically updates the DNS record for a specified domain in AWS Route 53 based on an external IP address. This is useful for maintaining a dynamic DNS (DDNS) setup where your external IP might change frequently.

The application is written in TypeScript, built with AWS SDK v3, and deployed on AWS Lambda.

## Features

- Update Route 53 DNS records automatically.
- Use auth token for security.
  - In case your endpoint url is leaked, without the right auth token, a malicious user cannot manipulate your DNS record.
  - It has built in token generator as well so that you can easily rotate your auth token for enhanced security.
- Written in TypeScript for type safety & it is typed extensively.
- Efficient packaging and deployment to AWS Lambda using `npm run zip` and `npm run deploy`.
- Unit tests using Jest for maintaining code quality.

## Running this app on AWS Lambda

### Prerequisites

- [An AWS account](https://aws.amazon.com/account/)
- A domain hosted on AWS Route53
- Assuming that you have the know-how of
  - Creating a Lambda function
  - Creating AWS API Gateway Resources & integrating it with a Lambda function
- Node.js (>=20.x.x)
- npm (>=10.x.x)

### Easy Deploy Prerequisites

If you want to use `npm run deploy` to easily create the Lambda function or update existing one, you need [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions) (configured with appropriate credentials).

You also need the appropriate policies in your AWS IAM account to be able to deploy.

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
      "Action": [
        "lambda:ListFunctions"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::<account-id>:role/<lambda-execution-role>"
    }
  ]
}
```

#### Note

The "lambda:CreateFunction" is optional. It is only needed if you want this application to automatically create the Lambda function for you.

But in order to create a Lambda function, you also need permission to assign role to the Lambda function. So you will need the following as well.

```json
{
  "Effect": "Allow",
  "Action": [
    "iam:CreateRole",
    "iam:AttachRolePolicy",
    "iam:GetRole",
    "iam:PassRole"
  ],
  "Resource": "arn:aws:iam::<account-id>:role/*"
}
```

Note: If you think the role is too permissive due to the `*` wildcard, use `arn:aws:iam::<account-id>:role/lambda-route53-execution-role` but the `lambda-route53-execution-role` value should be the same as the `LAMBDA_EXECUTION_ROLE_NAME` value in `.env`.

### Installation

#### Setup

Clone the repository:

```bash
git clone https://github.com/eddyvlad/auto-route53.git
cd auto-route53
```

Install the dependencies:

```bash
npm install
```

Configure `.env` file:

```bash
cp .env.default .env
```

### Deployment

The project includes an automated packaging and deployment workflow. It creates a `.zip` package ready for AWS Lambda and deploys it using the AWS CLI.

1. **Package and Deploy**

   To zip the project and deploy it to AWS Lambda, use:

   ```bash
   npm run zip
   npm run deploy
   ```

   This will:

- Build the project.
- Pack the files into `lambda-deployment.zip` (excluding unnecessary files like dev dependencies).
  - You can upload this zip directly to your Lambda function via the web console if you want.
- Deploy the package to your AWS Lambda function
  - This will check if you have existing Lambda function with the name configured in your `.env` file.
  - If you don't have such function, it will create one for you.
  - If the function already exists, it will update the code for you.

## Rationale

**Why is it overbuilt?**

I don't mind that it is overbuilt because it's meant for me to keep up with the coding standards, practices & various design patterns.
Besides, I'm very used to implementing codes in a way that is easily transferable to a junior software engineer and the modularity allows for multiple engineers to work on the same project concurrently.
This is a habit I picked up from leading a team of software engineers.

This is also why it has scripts to easily zip, deploy and even generate auth token. In a team setting, I want to be able to hand over this project to another team member and that team member to be able to continue this project with ease.

This is part and parcel of DevEx (Developer Experience), which I am passionate about.

This article best explains about developer experience.
[Developer experience: What is it and why should you care?](https://github.blog/enterprise-software/collaboration/developer-experience-what-is-it-and-why-should-you-care/)

**Why use typescript instead of just javascript?**

The same reason as to why it is overbuilt.

**Why have both esbuild & ts-node installed?**

I'm experimenting with esbuild & ts-node is needed to parse `jest.config.ts`.

**Why not build using esbuild?**

Esbuild requires a plugin to do typecheck while building. I don't want to add this plugin because at the moment, I'm only using it to run typescript files.

## Known Issues

Currently this project had been developed on MacOS 15 with NodeJS v20.10.0.
It is not meant to run on Windows or Linux. Feel free to contribute to make this compatible for multiple OS.
