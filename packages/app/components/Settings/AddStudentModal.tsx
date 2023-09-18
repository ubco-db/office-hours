import { ReactElement } from "react";
import Modal from "antd/lib/modal/Modal";
import { Input, Form } from "antd";
import { API } from "@koh/api-client";
import { default as React } from "react";
import { mutate } from "swr";
import { useState } from "react";
import { Role } from "@koh/common";

export function AddStudentModal({
  course,
  visible,
  onClose,
}: AddStudentModalProps): ReactElement {
  const [form] = Form.useForm();
  const [page] = useState(1);
  const [search] = useState("");

  const addStudent = async (userData: UBCOuserParam) => {
    await API.signup.registerStudent(userData);
    mutate(`${Role.STUDENT}/${page}/${search}`);
  };
  console.log(course);
  return (
    <Modal
      title="Add student manually"
      visible={visible}
      onCancel={onClose}
      onOk={async () => {
        const value = await form.validateFields();
        const userData: UBCOuserParam = {
          email: value.email,
          first_name: value.first_name,
          password: value.password,
          last_name: value.last_name,
          selected_course: course.id,
          sid: value.sid,
          photo_url: value.photo_url,
          courses: [],
        };
        await addStudent(userData);
        onClose();
      }}
    >
      <Form form={form}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input email!" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="first_name"
          rules={[{ required: true, message: "Please input first name!" }]}
        >
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input password!" }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          name="last_name"
          rules={[{ required: true, message: "Please input last name!" }]}
        >
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item name="sid">
          <Input placeholder="SID" type="number" />
        </Form.Item>
        <Form.Item name="photo_url">
          <Input placeholder="Photo URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
