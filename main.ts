// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformStack, CloudBackend, NamedCloudWorkspace } from "cdktf";
import * as google from '@cdktf/provider-google';

const project = 'automatic-winner';
const region = 'asia-northeast1';
const repository = 'automatic-winner';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new google.provider.GoogleProvider(this, 'google', {
      project,
      region,      
    });

    new google.storageBucket.StorageBucket(this, 'metrics-bucket', {
      location: region,
      name: `metrics-${project}`,      
    });

    new google.pubsubTopic.PubsubTopic(this, 'performance-alerts', {
      name: 'performance-alerts',
    });

    new google.cloudbuildTrigger.CloudbuildTrigger(this, 'build-trigger', {
      filename: 'cloudbuild.yaml',
      github: {
        owner: 'hsmtkk',
        name: repository,
        push: {
          branch: 'main',
        },
      },
    });

  }
}

const app = new App();
const stack = new MyStack(app, "automatic-winner");
new CloudBackend(stack, {
  hostname: "app.terraform.io",
  organization: "hsmtkkdefault",
  workspaces: new NamedCloudWorkspace("automatic-winner")
});
app.synth();
