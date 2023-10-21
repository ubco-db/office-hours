/* eslint-disable @typescript-eslint/no-unused-vars */

import { InboxOutlined } from "@ant-design/icons";
import { API } from "@koh/api-client";
import { GetOrganizationResponse } from "@koh/common";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Switch,
  Upload,
  Image,
  message,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type OrganizationSettingsProps = {
  organization: GetOrganizationResponse;
};

export default function SettingsTab({
  organization,
}: OrganizationSettingsProps): ReactElement {
  const [formGeneral] = Form.useForm();
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState(organization.name);
  const [organizationDescription, setOrganizationDescription] = useState(
    organization.description
  );
  const [organizationWebsiteUrl, setOrganizationWebsiteUrl] = useState(
    organization.websiteUrl
  );
  const [organizationLogoUrl, setOrganizationLogoUrl] = useState(
    organization.logoUrl
  );
  const [organizationBannerUrl, setOrganizationBannerUrl] = useState(
    organization.bannerUrl
  );

  const normFile = (e: any) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const updateGeneral = async () => {
    const formValues = await formGeneral.validateFields();
    const organizationNameField = formValues.organizationName;
    const organizationDescriptionField = formValues.organizationDescription;
    const organizationWebsiteUrlField = formValues.organizationWebsiteUrl;

    if (
      organizationNameField === organizationName &&
      organizationDescriptionField === organizationDescription &&
      organizationWebsiteUrlField === organizationWebsiteUrl
    ) {
      message.info(
        "Organization was not updated as information has not been changed"
      );
      return;
    }

    if (organizationNameField.length < 4) {
      message.error("Organization name must be at least 4 characters");
      return;
    }

    if (organizationDescriptionField.length < 10) {
      message.error("Organization description must be at least 10 characters");
      return;
    }

    if (
      organizationWebsiteUrlField &&
      !isValidUrl(organizationWebsiteUrlField)
    ) {
      message.error(
        "Organization URL must be at least 4 characters and be a valid URL"
      );
      return;
    }

    await API.organizations
      .patch(organization.id, {
        name: organizationNameField,
        description: organizationDescriptionField,
        websiteUrl: organizationWebsiteUrlField,
      })
      .then((_) => {
        setOrganizationName(organizationNameField);
        setOrganizationDescription(organizationDescriptionField);
        setOrganizationWebsiteUrl(organizationWebsiteUrlField);
        message.success("Organization information was updated");
        setTimeout(() => {
          router.reload();
        }, 1750);
      })
      .catch((error) => {
        const errorMessage = error.response.data.message;

        message.error(errorMessage);
      });
  };

  return (
    <>
      <Card title="General" bordered={true} style={{ marginTop: 10 }}>
        <Form
          form={formGeneral}
          onFinish={updateGeneral}
          layout="vertical"
          initialValues={{
            organizationName: organizationName,
            organizationDescription: organizationDescription,
            organizationWebsiteUrl: organizationWebsiteUrl,
          }}
        >
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <Form.Item
                label="Organization Name"
                name="organizationName"
                tooltip="Name of your organization"
              >
                <Input allowClear={true} defaultValue={organizationName} />
              </Form.Item>
            </Col>

            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <Form.Item
                label="Organization Website URL"
                name="organizationWebsiteUrl"
                tooltip="Website URL of your organization"
              >
                <Input
                  allowClear={true}
                  defaultValue={organizationWebsiteUrl}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Organization Description"
            name="organizationDescription"
            tooltip="Description of your organization"
          >
            <TextArea
              defaultValue={organizationDescription}
              rows={4}
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Logo & Banner" bordered={true} style={{ marginTop: 10 }}>
        <Form layout="vertical">
          <Form.Item label="Logo">
            <Form.Item
              name="organizationLogo"
              valuePropName="organizationFileLogo"
              getValueFromEvent={normFile}
              noStyle
            >
              <Row
                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                style={{ alignItems: "center" }}
              >
                <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                  <Upload.Dragger
                    disabled={true}
                    name="organizationLogoFile"
                    maxCount={1}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload.
                    </p>
                  </Upload.Dragger>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                  <Image width={100} src={organizationLogoUrl} />
                </Col>
              </Row>
            </Form.Item>
          </Form.Item>

          <Form.Item label="Banner">
            <Form.Item
              name="organizationBanner"
              valuePropName="organizationFileBanner"
              getValueFromEvent={normFile}
              noStyle
            >
              <Row
                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                style={{ alignItems: "center" }}
              >
                <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                  <Upload.Dragger
                    disabled={true}
                    name="organizationBannerFile"
                    maxCount={1}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload.
                    </p>
                  </Upload.Dragger>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                  <Image width={250} src={organizationBannerUrl} />
                </Col>
              </Row>
            </Form.Item>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="SSO"
        bordered={true}
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        <Form layout="vertical">
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <Form.Item
                label="Organization SSO URL"
                name="organizationWebsiteUrl"
                tooltip="SSO URL used by organization to authenticate user"
              >
                <Input
                  allowClear={true}
                  defaultValue={organization.ssoUrl}
                  disabled={true}
                />
              </Form.Item>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <Form.Item
                label="SSO Authorization"
                name="organizationSSOEnabled"
                tooltip="Whether users use organization's authentication system"
              >
                <Switch
                  disabled={true}
                  defaultChecked={organization.ssoEnabled}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
}
