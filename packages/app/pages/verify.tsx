import Head from 'next/head'
import React, { ReactElement } from 'react'
import { StandardPageContainer } from '../components/common/PageContainer'
import { useProfile } from '../hooks/useProfile'
import { Button, Card, Form, Input, Spin } from 'antd'

export default function Verify(): ReactElement {
  const profile = useProfile()

  return profile ? (
    <StandardPageContainer>
      <Head>
        <title>Verify Email Address</title>
      </Head>
      <div className="mx-auto mt-40 flex items-center justify-center md:w-2/5">
        <Card>
          <h1>Verify your email address</h1>
          <p className="mt-4">
            We have sent a verification email to{' '}
            <strong>{profile.email}</strong>. Please check your email and enter
            the verification code below.
          </p>
          <Form className="mx-auto mt-5 w-4/5">
            <Form.Item
              name="verificationCode"
              rules={[
                {
                  required: true,
                  message: 'Please input your verification code',
                },
                {
                  min: 7,
                  message: 'Verification code must be at least 7 characters',
                },
                {
                  max: 7,
                  message: 'Verification code must be at most 7 characters',
                },
              ]}
            >
              <Input
                type="text"
                placeholder="A2C1E0E"
                maxLength={7}
                className="fs-5 p-5 text-center text-2xl tracking-[.55em]"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="mt-3 h-auto w-full items-center justify-center border px-2 py-2"
            >
              <span>Confirm Email Address</span>
            </Button>
          </Form>
        </Card>
      </div>
    </StandardPageContainer>
  ) : (
    <Spin />
  )
}
