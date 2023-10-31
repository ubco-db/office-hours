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
  const [edit, setEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (courseId) {
      getEvent();
    }
  }, [courseId, editModalVisible]);
  useEffect(() => {
    if (selectedEvent) {
      setEditModalVisible(true);
    }
  }, [selectedEvent]);

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

    if (event.endDate) {
      return {
        id: event.id,
        title: event.title,
        daysOfWeek: event.daysOfWeek,
        startTime: format(startDate, "HH:mm"),
        endTime: format(endDate, "HH:mm"),
        endRecur: event.endDate,
      };
    } else {
      // Non-recurring event
      return {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate,
      };
    }
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
            eventClick={(clickInfo) => {
              setSelectedEvent({
                id: clickInfo.event.id,
                start: clickInfo.event.start,
                end: clickInfo.event.end,
                title: clickInfo.event.title,
              });
              setEdit(true);
            }}
            select={(select) => {
              setSelectedEvent({
                start: select.start,
                end: select.end,
              });
              setEdit(false);
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
            edit={edit}
            courseId={courseId}
          />
        </CalendarWrapper>
      )}
    </div>
  );
}
