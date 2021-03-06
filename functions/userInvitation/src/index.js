import React from "react";
import { renderEmail } from "react-html-email";
import Ajv from "ajv";

import schema from "../schema.json";
import Template from "./template";
import textTemplate from "./template.text";
import Client from "shared/email";
import * as site from "shared/constants/site";

const client = new Client(process.env.POSTMARK_TOKEN);

export const handle = (data, context, callback) => {
  const ajv = new Ajv({ allErrors: true });
  const isValid = ajv.validate(schema, data);
  if (!isValid) {
    return callback(`Validation errors: ${ajv.errorsText()}`); // eslint-disable-line
  }
  console.log(
    `Validated data. ${context.getRemainingTimeInMillis()}ms remaining until timeout.`
  );

  const html = renderEmail(<Template {...data} />);
  console.log(
    `HTML template rendered. ${context.getRemainingTimeInMillis()}ms remaining until timeout.`
  );

  const text = textTemplate(data);
  console.log(
    `Text template rendered. ${context.getRemainingTimeInMillis()}ms remaining until timeout.`
  );

  client.sendEmail(
    {
      From: site.fromEmail,
      To: data.user.email,
      Subject: `You've been invited to join ${data.group.name} on ${
        site.name
      }!`,
      TextBody: text,
      HtmlBody: html,
      Tag: "invite"
    },
    err => callback(JSON.stringify(err))
  );
  console.log(
    `Email sent to Postmark. ${context.getRemainingTimeInMillis()}ms remaining until timeout.`
  );
};
