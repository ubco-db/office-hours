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
export default function StudentSchedulePanel({
  courseId,
  defaultView = "timeGridWeek",
}: ScheduleProps): ReactElement {
  const [isClientSide, setIsClientSide] = useState(false);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const spinnerRef = useRef(null);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    if (courseId) {
      getEvent();
    }
  }, [courseId]);

  const getEvent = async () => {
    await API.calendar.getEvents(Number(courseId)).then((result) => {
      const modifiedEvents = result.map((event) => parseEvent(event));
      setEvents(modifiedEvents);
    });
  };
  const parseEvent = (event) => {
    if (event.daysOfWeek) {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      return {
        id: event.id,
        title: event.title,
        daysOfWeek: event.daysOfWeek,
        startTime: format(startDate, "HH:mm"),
        endTime: format(endDate, "HH:mm"),
      };
    } else {
      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
      };
    }
  };
  const renderEventContent = (arg: EventContentArg) => {
    const data = calendarRef.current.getApi().getCurrentData();
    const viewSpec = data.viewSpecs[arg.view.type].component;
    if (viewSpec === DayTimeColsView) {
      return (
        <Tooltip title={`${arg.timeText}: ${arg.event.title}`}>
          <span>
            <strong>{arg.timeText}</strong> {arg.event.title}
          </span>
        </Tooltip>
      );
    }
  };

  return (
    <div>
      <SpinnerContainer ref={spinnerRef}>
        <Spin />
      </SpinnerContainer>
      {isClientSide && !isNaN(courseId) && (
        <CalendarWrapper>
          <FullCalendar
            selectable={true}
            editable={true}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            events={events}
            scrollTime="10:00:00" // auto set each day's view to begin at 8AM
            initialView={defaultView}
            initialEvents={events}
            eventContent={renderEventContent}
            headerToolbar={{
              start: "title",
              center: "dayGridMonth timeGridWeek timeGridDay listWeek",
              end: "today prev,next",
            }}
            loading={(loading) => {
              if (spinnerRef.current)
                spinnerRef.current.style.display = loading ? "flex" : "none";
            }}
            height="70vh"
            timeZone="local"
          />
        </CalendarWrapper>
      )}
    </div>
  );
}
