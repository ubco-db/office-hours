import { API } from "@koh/api-client";
import { TACheckoutResponse } from "@koh/common";
import { Button, Modal, Space } from "antd";
import moment from "moment";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import styled from "styled-components";
import { useCourse } from "../../hooks/useCourse";
import { useQueue } from "../../hooks/useQueue";

const CheckinButton = styled(Button)`
  background: #2a9187;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

const CheckOutButton = styled(Button)`
  color: #da3236;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px;
`;

const CheckoutModalButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

type CheckInButtonState =
  | "CheckedIn"
  | "CheckedOut"
  | "CheckedIntoOtherQueueAlready";

interface TACheckinButtonProps {
  courseId: number;
  room: string; // name of room to check into
  state: CheckInButtonState; // State of the button
  block?: boolean;
}
const EMPTY_CHECKOUT_INFO = { canClearQueue: false, nextOfficeHourTime: null };

export default function TACheckinButton({
  courseId,
  room,
  state,
  block = false,
}: TACheckinButtonProps): ReactElement {
  const router = useRouter();

  const { course, mutateCourse } = useCourse(courseId);
  const { queue } = useQueue(course?.queues?.find((q) => q.room === room)?.id);

  async function checkInTA() {
    // to see old check in in person functionality look at commit b4768bbfb0f36444c80961703bdbba01ff4a5596
    //trying to limit changes to the frontend, all queues will have the room online
    const redirectID = await API.taStatus.checkIn(courseId, room);

    router.push(
      "/course/[cid]/queue/[qid]",
      `/course/${courseId}/queue/${redirectID.id}`
    );
  }

  const [checkoutModalInfo, setCheckoutModalInfo] = useState<
    TACheckoutResponse
  >(EMPTY_CHECKOUT_INFO);

  return (
    <>
      {state === "CheckedIn" && (
        <CheckOutButton
          type="default"
          size="large"
          block={block}
          data-cy="check-out-button"
          onClick={async () => {
            setCheckoutModalInfo(await API.taStatus.checkOut(courseId, room));
            mutateCourse();
          }}
        >
          Check Out
        </CheckOutButton>
      )}
      {state === "CheckedOut" && (
        <CheckinButton
          type="default"
          size="large"
          block={block}
          onClick={() => checkInTA()}
          disabled={!course}
          data-cy="check-in-button"
        >
          Check In
        </CheckinButton>
      )}
      <Modal
        visible={checkoutModalInfo.canClearQueue}
        title="Let's clean up..."
        footer={[
          <Button
            key="keep"
            onClick={() => setCheckoutModalInfo(EMPTY_CHECKOUT_INFO)}
          >
            Leave Students In Queue
          </Button>,
          <Button
            key="clear"
            type="primary"
            onClick={() => API.queues.clean(queue?.id)}
          >
            Clear Queue
          </Button>,
        ]}
      >
        You are the last TA to leave. There will not be any office hours for{" "}
        <strong>
          {moment(checkoutModalInfo.nextOfficeHourTime).fromNow(true)}
        </strong>
        . Do you want to clear the remaining students out of the queue?
      </Modal>
    </>
  );
}
