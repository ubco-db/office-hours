import React, { useState, useEffect } from "react";
import { API } from "@koh/api-client";
import { Divider } from "antd";

const EventForToday = ({ courseId }: { courseId: number }) => {
  const [eventsForTheDay, setEventsForTheDay] = useState([]);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDate = new Date();
    const dateString = currentDate.toISOString();

    const fetchEvents = async () => {
      try {
        const events = await API.calendar.getEventsForTheDay(
          courseId,
          dateString,
          timezone
        );
        console.log(events);
        setEventsForTheDay(events);
      } catch (error) {
        console.error("Failed to fetch events for the day:", error);
      }
    };

    fetchEvents();
  }, [courseId]);

  return (
    <>
      <Divider
        orientation="left"
        style={{ marginBottom: "0px", paddingBottom: "0px" }}
      >
        Events for Today
      </Divider>
      {eventsForTheDay.map((event, index) => (
        <>
          <div>
            <h3>{event.title}</h3>
            {event.locationType === "in-person" && (
              <p>Location: {event.locationInPerson}</p>
            )}
            {event.locationType === "online" && (
              <p>Location: {event.locationOnline}</p>
            )}
            {event.locationType === "hybrid" && (
              <>
                <p>Location: {event.locationInPerson}</p>
                <p>
                  Online Link: <a>{event.locationOnline}</a>
                </p>
              </>
            )}
          </div>
        </>
      ))}
    </>
  );
};

export default EventForToday;
