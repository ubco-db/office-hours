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
import { calendarEventLocationType } from "@koh/common";

const dayToIntMapping = {
  Sunday: "0",
  Monday: "1",
  Tuesday: "2",
  Wednesday: "3",
  Thursday: "4",
  Friday: "5",
  Saturday: "6",
};
type EditEventModalProps = {
  visible: boolean;
  onClose: () => void;
  event: any;
  courseId: number;
};

const EditEventModal = ({
  visible,
  onClose,
  event,
  courseId,
}: EditEventModalProps) => {
  const [form] = Form.useForm();
  const [isRepeating, setIsRepeating] = useState(null);
  const [isInPerson, setIsInPerson] = useState(null);
  const [location, setLocation] = useState(event?.locationDetail);
  const intToDayMapping = Object.keys(dayToIntMapping).reduce((acc, day) => {
    acc[dayToIntMapping[day]] = day;
    return acc;
  }, {});
  const daysOfWeekNames =
    event?.daysOfWeek?.map((intValue) => intToDayMapping[intValue]) || [];
  const [selectedDays, setSelectedDays] = useState(daysOfWeekNames);
  const handleDaysChange = (checkedValues) => {
    if (!checkedValues.includes(moment(event.start).format("dddd"))) {
      checkedValues.push(moment(event.start).format("dddd"));
    }
    setSelectedDays(checkedValues);
  };
  useEffect(() => {
    console.log("event", event);
    form.setFieldsValue({
      title: event ? event.title : null,
      location: event?.location,
      eventType: event?.locationType,
      endDate: event ? moment(event.endDate) : null,
    });
    if (event?.daysOfWeek && event?.endRecur) {
      setIsRepeating(true);
    }
    setIsInPerson(event?.locationType === calendarEventLocationType.inPerson);
    if (event) {
      if (event.daysOfWeek) {
        const mappedDays = event.daysOfWeek.map(
          (intValue) => intToDayMapping[intValue],
        );
        setSelectedDays(mappedDays);
      } else {
        setSelectedDays([moment(event.start).format("dddd")]);
      }
    }
  }, [event, visible]);

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

      updateEvent(eventObject);
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
      locationDetail: rawEvent.locationDetail || null,
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
          title: event ? event.title : "",
          startTime: event
            ? moment(event.startTime).format("YYYY-MM-DD HH:mm:ss")
            : null,
          endTime: event
            ? moment(event.endTime).format("YYYY-MM-DD HH:mm:ss")
            : null,
          eventType: "online",
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
            <span>{event ? event.startTime : "Select time"}</span>
          </Tooltip>
        </Form.Item>
        <Form.Item label="End Time" name="endTime">
          <Tooltip title="To change the time, exit this modal and reselect by dragging over a new area.">
            <span>{event ? event.endTime : "Select time"}</span>
          </Tooltip>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={isRepeating}
            onChange={(e) => setIsRepeating(e.target.checked)}
            defaultChecked={isRepeating}
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
            onChange={(e) => setIsInPerson(e.target.value === "in-person")}
          >
            <Radio value="in-person">In-Person</Radio>
            <Radio value="online">Online</Radio>
            <Radio value="hybrid">Hybrid</Radio>
          </Radio.Group>
        </Form.Item>

        {isInPerson ? (
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please input the location" }]}
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
