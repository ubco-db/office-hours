import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Checkbox,
  Radio,
  Tooltip,
  message,
} from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import { API } from "@koh/api-client";
import { on } from "events";

const dayToIntMapping = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
type EditEventModalProps = {
  visible: boolean;
  onClose: () => void;
  event: any;
  edit: boolean;
  courseId: number;
};

const EditEventModal = ({
  visible,
  onClose,
  event,
  edit,
  courseId,
}: EditEventModalProps) => {
  const [form] = Form.useForm();
  const [isRepeating, setIsRepeating] = useState(false);
  const [isInPerson, setIsInPerson] = useState(true);
  const [selectedDays, setSelectedDays] = useState([
    moment(event?.start).format("dddd"),
  ]);
  const handleDaysChange = (checkedValues) => {
    // Ensure the day of the event is always selected
    if (!checkedValues.includes(moment(event.start).format("dddd"))) {
      checkedValues.push(moment(event.start).format("dddd"));
    }
    setSelectedDays(checkedValues);
  };

  useEffect(() => {
    form.setFieldsValue({
      title: event ? event.title : null,
      location: event ? event.location : null,
      zoomLink: event ? event.zoomLink : null,
      endDate: event ? moment(event.endDate) : null,
    });
    setIsRepeating(false);
    setIsInPerson(true);
    if (event) {
      setSelectedDays([moment(event.start).format("dddd")]);
    }
  }, [event]);
  const handleOk = async () => {
    try {
      const formData = await form.validateFields();
      const eventObject = {
        ...formData,
        isRepeating,
        locationType: isInPerson ? "in-person" : "online",
        repeatDays: isRepeating ? selectedDays : [],
        zoomLink: isInPerson ? undefined : formData.zoomLink,
        location: isInPerson ? formData.location : undefined,
      };

      if (edit) {
        updateEvent(eventObject);
      } else {
        createEvent(eventObject);
      }
    } catch (validationError) {
      console.error("Validation failed:", validationError);
    }
  };
  const formatEvent = (rawEvent, courseId) => {
    // Convert the Moment objects to JavaScript Date
    const formattedEvent = {
      cid: courseId,
      title: rawEvent.title,
      start: rawEvent.startTime.toDate(),
      end: rawEvent.endTime.toDate(),
      locationType: rawEvent.locationType,
      locationDetail: rawEvent.location || null,
    };
    if (selectedDays) {
      formattedEvent["daysOfWeek"] = selectedDays.map(
        (day) => dayToIntMapping[day],
      );
    }
    if (rawEvent.endDate) {
      formattedEvent["endDate"] = rawEvent.endDate.toDate();
    }
    return formattedEvent;
  };
  const createEvent = async (newEvent) => {
    try {
      const formattedEvent = formatEvent(newEvent, courseId);
      const response = await API.calendar.addCalendar(formattedEvent);
      console.log(formattedEvent);
      if (response) {
        console.log("Event created successfully", response);
      } else {
        console.error("Failed to create event");
      }
    } catch (err) {
      console.error("Error creating the event:", err.message || err);
    }
    onClose();
  };

  const updateEvent = async (updatedEvent) => {
    try {
      const formattedEvent = formatEvent(updatedEvent, courseId);
      const response = await API.calendar.patchEvent(event.id, formattedEvent);
      if (response) {
        console.log("Event updated successfully", response);
      } else {
        console.error("Failed to update event");
      }
    } catch (err) {
      console.error("Error updating the event:", err.message || err);
    }
    onClose();
  };
  return (
    <Modal open={visible} onOk={handleOk} onCancel={onClose} closable={false}>
      <Form
        form={form}
        initialValues={{
          startTime: event ? moment(event.start) : null,
          endTime: event ? moment(event.end) : null,
          title: event ? event.title : null,
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input the title!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Start Time" name="startTime">
          <Tooltip title="To change the time, exit this modal and reselect by dragging over a new area.">
            <span>
              {event ? moment(event.start).format("HH:mm") : "Select time"}
            </span>
          </Tooltip>
        </Form.Item>
        <Form.Item label="End Time" name="endTime">
          <Tooltip title="To change the time, exit this modal and reselect by dragging over a new area.">
            <span>
              {event ? moment(event.end).format("HH:mm") : "Select time"}
            </span>
          </Tooltip>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={isRepeating}
            onChange={(e) => setIsRepeating(e.target.checked)}
          >
            Repeat Event
          </Checkbox>
        </Form.Item>

        {isRepeating ? (
          <>
            <Form.Item label="End Date" name="endDate">
              <DatePicker />
            </Form.Item>
            <Form.Item label="Repeat on">
              <Checkbox.Group
                name="repeatDays"
                value={selectedDays}
                onChange={handleDaysChange}
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <Checkbox
                    key={day}
                    value={day}
                    disabled={day === moment(event.start).format("dddd")}
                  >
                    {day}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </>
        ) : (
          <Form.Item label="Event Day">
            <span>{moment(event?.start).format("dddd")}</span>
          </Form.Item>
        )}

        <Form.Item label="Event Type" name="eventType">
          <Radio.Group
            value={isInPerson ? "in-person" : "online"}
            onChange={(e) => setIsInPerson(e.target.value === "in-person")}
          >
            <Radio value="in-person">In-Person</Radio>
            <Radio value="online">Online</Radio>
          </Radio.Group>
        </Form.Item>

        {isInPerson ? (
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please input the Zoom link!" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <Form.Item
            label="Zoom Link"
            name="location"
            rules={[{ required: true, message: "Please input the Zoom link!" }]}
          >
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EditEventModal;
