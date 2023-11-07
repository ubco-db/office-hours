import {
  ReactElement,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import FullCalendar, { EventContentArg } from "@fullcalendar/react"; // must go before plugins
import timeGridPlugin, { DayTimeColsView } from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import interactionPlugin from "@fullcalendar/interaction";
import { Form, Input, Modal, Spin, Switch, Tooltip, message } from "antd";
import { useRoleInCourse } from "../../hooks/useRoleInCourse";
import styled from "styled-components";
import "./fullcalendar.css";
import { API } from "@koh/api-client";
import { Role } from "@koh/common";
import { format } from "date-fns";
import EditEventModal from "./EditEventModal";
import { set } from "lodash";
import CreateEventModal from "./CreateEventModal";

const CalendarWrapper = styled.div`
  margin-bottom: 20px;
`;
const SpinnerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #f8f9fb99;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type ScheduleProps = {
  courseId: number;
  defaultView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
};
export default function TASchedulePanel({
  courseId,
  defaultView = "timeGridWeek",
}: ScheduleProps): ReactElement {
  const [form] = Form.useForm();
  const calendarRef = useRef(null);
  const spinnerRef = useRef(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createEvent, setCreateEvent] = useState(null);
  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (courseId) {
      getEvent();
    }
  }, [courseId, editModalVisible, createModalVisible]);

  //format events-all repeated ones need to start time and endTime, the other ones are regular stuff
  const getEvent = async () => {
    try {
      const result = await API.calendar.getEvents(Number(courseId));
      const modifiedEvents = result.map((event) => parseEvent(event));
      setEvents(modifiedEvents);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setEvents([]);
      } else {
        console.error("An error occurred while fetching events:", error);
      }
    }
  };
  const parseEvent = (event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const returnEvent = {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      locationType: event.locationType,
      locationInPerson: event.locationInPerson,
      locationOnline: event.locationOnline,
    };
    if (event.endDate) {
      returnEvent["endRecur"] = event.endDate;
      returnEvent["daysOfWeek"] = event.daysOfWeek;
      returnEvent["startTime"] = format(startDate, "HH:mm");
      returnEvent["endTime"] = format(endDate, "HH:mm");
      return returnEvent;
    } else {
      // Non-recurring event
      return returnEvent;
    }
  };
  const handleEditClick = (clickInfo) => {
    console.log(clickInfo.event);
    console.log(events);
    for (let i = 0; i < events.length; i++) {
      if (Number(events[i].id) === Number(clickInfo.event.id)) {
        setSelectedEvent(events[i]);
        console.log(selectedEvent);
        break; // exit loop once a match is found
      }
    }
    setEditModalVisible(true);
  };

  return (
    <div>
      <SpinnerContainer ref={spinnerRef}>
        <Spin />
      </SpinnerContainer>
      {!isNaN(courseId) && (
        <CalendarWrapper>
          <FullCalendar
            selectable={true}
            editable={true}
            ref={calendarRef}
            plugins={[
              timeGridPlugin,
              iCalendarPlugin,
              dayGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            // eventclick means update
            eventClick={handleEditClick}
            select={(select) => {
              setCreateEvent({
                start: select.start,
                end: select.end,
              });
              setCreateModalVisible(true);
            }}
            events={events}
            scrollTime="13:00:00" // auto set each day's view to begin at x AM
            initialView={defaultView}
            initialEvents={events}
            headerToolbar={{
              start: "title",
              center: "dayGridMonth timeGridWeek timeGridDay listWeek",
              end: "today prev,next",
            }}
            loading={(loading) => {
              if (spinnerRef.current)
                spinnerRef.current.style.display = loading ? "flex" : "none";
            }}
            height="100vh"
          />
          <EditEventModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            event={selectedEvent}
            courseId={courseId}
          />
          <CreateEventModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            event={createEvent}
            courseId={courseId}
          />
        </CalendarWrapper>
      )}
    </div>
  );
}
