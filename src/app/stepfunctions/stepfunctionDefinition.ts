export const stepfunction = {
    "Comment": "An example of the Amazon States Language for notification on an AWS Fargate task completion",
    "StartAt": "Run Fargate Task",
    "TimeoutSeconds": 3600,
    "States": {
        "Start": {
            "Type": "Pass",
            "Next": "ParallelWrapper"
        },
      "ParallelWrapper": {
        "Type": "Parallel",
        "Next": "PickAThing",
        "Branches": [
          {
            "StartAt": "Step 1.1",
            "States": {
                "Step 1.1": {
                    "Type": "Task",
                    "Resource": "arn:aws:states:::lambda:invoke",
                    "Next": "Step 1.2",
                    "Parameters": {
                        "FunctionName": "arn:aws:lambda:us-west-2:123456789012:function:Step1",
                        "Payload": {
                            "input.$": "$"
                        }
                    }
                },
                "Step 1.2": {
                    "Type": "Task",
                    "Resource": "arn:aws:states:::lambda:invoke",
                    "Parameters": {
                        "FunctionName": "arn:aws:lambda:us-west-2:123456789012:function:Step2",
                        "Payload": {
                            "input.$": "$"
                        }
                    },
                    "End": true
                },
            }
          },
          {
            "StartAt": "Inner Parallel",
            "States": {
                "Inner Parallel": {
                    "Type": "Parallel",
                    "Branches": [
                        {
                            "StartAt": "Jesus",
                            "States": {
                                "Jesus": {
                                    "Type": "Task",
                                    "Resource": "arn:aws:states:::lambda:invoke",
                                    "Parameters": {
                                        "FunctionName": "arn:aws:lambda:us-west-2:123456789012:function:Step3",
                                        "Payload": {
                                            "input.$": "$"
                                        }
                                    },
                                    "End": true
                                }
                            }
                        }
                    ],
                    "End": true
              }
            }
          }
        ]
      },
      "PickAThing": {
        "Type": "Choice",
        "Choices": [
          {
            "Variable": "$.thing",
            "StringEquals": "foo",
            "Next": "Run Fargate Task"
          },
          {
            "Variable": "$.thing",
            "StringEquals": "bar",
            "Next": "Notify Success"
          }
        ],
        "Default": "Notify Failure"
      },
      "Run Fargate Task": {
        "Type": "Task",
        "Resource": "arn:aws:states:::ecs:runTask.sync",
        "Parameters": {
          "LaunchType": "FARGATE",
          "Cluster": "arn:aws:ecs:ap-northeast-1:123456789012:cluster/FargateTaskNotification-ECSCluster-VHLR20IF9IMP",
          "TaskDefinition": "arn:aws:ecs:ap-northeast-1:123456789012:task-definition/FargateTaskNotification-ECSTaskDefinition-13YOJT8Z2LY5Q:1",
          "NetworkConfiguration": {
            "AwsvpcConfiguration": {
              "Subnets": [
                "subnet-07e1ad3abcfce6758",
                "subnet-04782e7f34ae3efdb"
              ],
              "AssignPublicIp": "ENABLED"
            }
          }
        },
        "Next": "Notify Success",
        "Catch": [
            {
              "ErrorEquals": [ "States.ALL" ],
              "Next": "Notify Failure"
            }
        ]
      },
      "Notify Success": {
        "Type": "Task",
        "Resource": "arn:aws:states:::sns:publish",
        "Parameters": {
          "Message": "AWS Fargate Task started by Step Functions succeeded",
          "TopicArn": "arn:aws:sns:ap-northeast-1:123456789012:FargateTaskNotification-SNSTopic-1XYW5YD5V0M7C"
        },
        "End": true
      },
      "Notify Failure": {
        "Type": "Task",
        "Resource": "arn:aws:states:::sns:publish",
        "Parameters": {
          "Message": "AWS Fargate Task started by Step Functions failed",
          "TopicArn": "arn:aws:sns:ap-northeast-1:123456789012:FargateTaskNotification-SNSTopic-1XYW5YD5V0M7C"
        },
        "End": true
      }
    }
  }