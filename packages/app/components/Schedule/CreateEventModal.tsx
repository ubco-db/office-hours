import { Modal, Form, Input, DatePicker, Checkbox, Radio, Tooltip } from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import { API } from "@koh/api-client";
import { calendarEventLocationType } from "@koh/common";

const dayToIntMapping = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

type CreateEventModalProps = {
  visible: boolean;
  onClose: () => void;
  courseId: number;
  event: any;
};

const CreateEventModal = ({
  event,
  visible,
  onClose,
  courseId,
}: CreateEventModalProps) => {
  const [form] = Form.useForm();
  const [isRepeating, setIsRepeating] = useState(false);
  const [isInPerson, setIsInPerson] = useState(true);
  const [selectedDays, setSelectedDays] = useState(null);
  const [location, setLocation] = useState(null);
  useEffect(() => {
    setSelectedDays([moment(event?.start).format("dddd")]);
  }, [event]);
  const handleDaysChange = (checkedValues) => {
    if (!checkedValues.includes(moment(event?.start).format("dddd"))) {
      checkedValues.push(moment(event?.start).format("dddd"));
    }
    setSelectedDays(checkedValues);
  };

  const handleOk = async () => {
    try {
      const formData = await form.validateFields();
      const eventObject = {
        ...formData,
        isRepeating,
        locationType: isInPerson
          ? calendarEventLocationType.inPerson
          : calendarEventLocationType.online,
        repeatDays: isRepeating ? selectedDays : undefined,
        zoomLink: !isInPerson ? location : undefined,
        locationDetail: isInPerson ? location : undefined,
      };
      createEvent(eventObject);
    } catch (validationError) {
      console.error("Validation failed:", validationError);
    }
  };

  const formatEvent = (rawEvent, courseId) => {
    // Convert the Moment objects to JavaScript Date
    const formattedEvent = {
      cid: courseId,
      title: rawEvent.title,
      start: new Date(event.start), // Convert to ISO string
      end: new Date(event.end),
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
      console.log("Creating event:", formattedEvent);
      const response = await API.calendar.addCalendar(formattedEvent);
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

  return (
    <Modal open={visible} onOk={handleOk} onCancel={onClose} closable={false}>
      <Form form={form}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input the title!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Start Time" name="startTime">
          <Tooltip title="To change the time, exit this modal and reselect by dragging over a new area.">
            <span>{moment(event?.start).format("HH:mm YYYY-MM-DD")}</span>
          </Tooltip>
        </Form.Item>
        <Form.Item label="End Time" name="endTime">
          <Tooltip title="To change the time, exit this modal and reselect by dragging over a new area.">
            <span>{moment(event?.end).format("HH:mm YYYY-MM-DD")}</span>
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
                {Object.keys(dayToIntMapping).map((day) => (
                  <Checkbox key={day} value={day}>
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
            <Radio value="hybrid">Hybrid </Radio>
          </Radio.Group>
        </Form.Item>

        {isInPerson ? (
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please input the Zoom link!" }]}
          >
            <Input onChange={setLocation} />
          </Form.Item>
        ) : (
          <Form.Item
            label="Zoom Link"
            name="location"
            rules={[{ required: true, message: "Please input the Zoom link!" }]}
          >
            <Input onChange={setLocation} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreateEventModal;
