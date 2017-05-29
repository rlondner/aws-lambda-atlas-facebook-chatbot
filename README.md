# Facebook weather chatbot with AWS Lambda, MongoDB Atlas and Yahoo! Weather

This repository is an advanced code sample demonstrating how to integrate a Facebook chat bot with Yahoo! Weather API using AWS Lambda and .

## Setup instructions

Please refer to [this blog post](https://www.mongodb.com/blog/post/developing-a-facebook-chatbot-with-aws-lambda-and-mongodb-atlas) for the full setup instructions.

To install the required packages, run the following in a Terminal or command line window:

`npm install`

This will install all the required Node packages to run the Lambda function.



Note: I included the [zip.sh](https://github.com/rlondner/aws-lambda-atlas-sample/blob/master/zip.sh) script I use to easily create the archive.zip file to be uploaded to AWS Lambda.

## Test instructions

We recommend you use the [lambda-local NPM package](https://www.npmjs.com/package/lambda-local) to test your Lambda function locally with your Atlas cluster.

The [ll.sh](https://github.com/rlondner/aws-lambda-atlas-facebook-chatbot/blob/master/ll.sh) script allows you to easily run tests by configuring the following parameters:

```
ATLAS_USERNAME="<enter your Atlas user>"
ATLAS_PASSWORD="<enter your Atlas password>"
ATLAS_CLUSTER_NAME="<enter your Atlas cluster name>"
ATLAS_CLUSTER_SUFFIX="<enter your Atlas suffix>"
DATABASE_NAME="fbchats"
```

You can find out what the ATLAS_CLUSTER_NAME and ATLAS_CLUSTER_SUFFIX parameters are by carefully looking at the connection string you can retrieve from your Atlas cluster.

These parameters feed into the following connection string format:

```
mongodb://$ATLAS_USERNAME:$ATLAS_PASSWORD@$ATLAS_CLUSTER_NAME-shard-00-00-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017,$ATLAS_CLUSTER_NAME-shard-00-01-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017,$ATLAS_CLUSTER_NAME-shard-00-02-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017/$DATABASE_NAME?ssl=true&replicaSet=$ATLAS_CLUSTER_NAME-shard-0&authSource=admin
```

## Package and deploy instructions

- Run `sh zip.sh` to create an `archive.zip` file in the current folder.
- Create a Lambda function in the AWS Console and upload the `archive.zip` file you just created.

![](https://webassets.mongodb.com/_com_assets/cms/MongoDBAtlas_AWSLambda_33-sb0qb2hk7n.png)

- Create the following environment variables:
     - `MONGODB_ATLAS_CLUSTER_URI` and set it to the properly configured connection string of your Atlas cluster
     - `FACEBOOK_PAGE_TOKEN` and set it to the page token value you previously generated in the Messenger tab of your Facebook app

![](https://webassets.mongodb.com/_com_assets/cms/FacebookChatbot_LambdaEnvVar-cyjsyg7jrb.png)

You may also zip your files manually, as shown in the animated gif below:

![](https://webassets.mongodb.com/_com_assets/cms/lambda_zip-3bc0z9ph71.gif)


