import { ReactElement } from "react";
import Modal from "antd/lib/modal/Modal";
import { Input, Form } from "antd";
import { API } from "@koh/api-client";
import { default as React } from "react";
import { mutate } from "swr";
import { useState, useEffect } from "react";
import { Role, UBCOuserParam } from "@koh/common";

interface EditStudentModalProps {
  courseId: number;
  student: any;
  onClose: () => void;
}

export function EditStudentModal({
  courseId,
  student,
  onClose,
}: EditStudentModalProps): ReactElement {
  const [form] = Form.useForm();
  const [page] = useState(1);
  const [search] = useState("");

  const editStudent = async (userData: UBCOuserParam, id: number) => {
    try {
      await API.profile.editUser(userData, id);
      mutate(`${Role.STUDENT}/${page}/${search}`);
    } catch (error) {
      console.error("Failed to edit user:", error);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      edit_email: student?.email,
      edit_first_name: student?.firstName,
      edit_last_name: student?.lastName,
      edit_sid: student?.sid,
      edit_photo_url: student?.photo_url,
    });
  }, [student]);
  return (
    <Modal
      title="Edit Student"
      visible={!!student}
      onCancel={onClose}
      onOk={async () => {
        const value = await form.validateFields();
        const userData: UBCOuserParam = {
          email: value.edit_email,
          first_name: value.edit_first_name,
          password: value.edit_password || "",
          last_name: value.edit_last_name,
          selected_course: courseId,
          sid: parseInt(value.edit_sid),
          photo_url: value.edit_photo_url,
          courses: [],
        };
        await editStudent(userData, student.id);
        onClose();
      }}
    >
      <Form
        form={form}
        initialValues={{
          edit_email: student?.email,
          edit_firstName: student?.firstName,
          edit_lastName: student?.lastName,
          edit_sid: student?.sid,
          edit_photo_url: student?.photo_url,
        }}
      >
        <Form.Item
          label="Email"
          name="edit_email"
          rules={[{ required: true, message: "Please input the email!" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="edit_first_name"
          rules={[{ required: true, message: "Please input the first name!" }]}
        >
          <Input placeholder="First Name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="edit_last_name"
          rules={[{ required: true, message: "Please input the last name!" }]}
        >
          <Input placeholder="Last Name" />
        </Form.Item>

        <Form.Item label="Password" name="edit_password">
          <Input type="password" placeholder="Enter new password to update" />
        </Form.Item>
        <Form.Item label="Student id" name="edit_sid">
          <Input placeholder="SID" type="number" />
        </Form.Item>
        <Form.Item label="Photo URL" name="edit_photo_url">
          <Input placeholder="Photo URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
