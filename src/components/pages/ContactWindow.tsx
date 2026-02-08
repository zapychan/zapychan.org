import styled from "styled-components";
import { Anchor, Frame } from "react95";

const Wrapper = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const Title = styled.h2`
  color: #ff1493;
  margin: 0 0 12px 0;
  font-size: 18px;
  text-align: center;
`;

const Divider = styled.div`
  text-align: center;
  margin: 12px 0;
  font-size: 10px;
  color: #ff69b4;
  letter-spacing: 4px;
`;

const InfoBox = styled(Frame)`
  padding: 16px;
  margin: 12px 0;
  text-align: center;
`;

const ContactItem = styled.p`
  margin: 8px 0;
  font-size: 13px;
`;

const Label = styled.span`
  font-weight: bold;
  color: #ff1493;
`;

const CommissionBox = styled(Frame)`
  padding: 16px;
  margin: 16px 0;
`;

const CommissionTitle = styled.h3`
  color: #ff1493;
  font-size: 14px;
  margin: 0 0 8px 0;
  text-align: center;
`;

const StatusBadge = styled.span<{ $open: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: bold;
  color: white;
  background: ${({ $open }) => ($open ? "#ff69b4" : "#d4578a")};
  margin-left: 8px;
`;

export function ContactWindow() {
  return (
    <Wrapper>
      <Title>💌 Contact Me 💌</Title>
      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>

      <InfoBox variant="well">
        <ContactItem>
          <Label>Email:</Label>{" "}
          <Anchor href="mailto:hello@zapychan.org">hello@zapychan.org</Anchor>
        </ContactItem>
        <ContactItem>
          <Label>Twitter/X:</Label>{" "}
          <Anchor href="https://twitter.com/zapychan" target="_blank">
            @zapychan
          </Anchor>
        </ContactItem>
        <ContactItem>
          <Label>Instagram:</Label>{" "}
          <Anchor href="https://instagram.com/zapychan" target="_blank">
            @zapychan
          </Anchor>
        </ContactItem>
      </InfoBox>

      <CommissionBox variant="field">
        <CommissionTitle>
          ✿ Commissions <StatusBadge $open>OPEN</StatusBadge>
        </CommissionTitle>
        <Divider>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</Divider>
        <ContactItem>
          i'm currently accepting commissions for both traditional paintings and
          digital art!
        </ContactItem>
        <ContactItem>
          <strong>Traditional (oil/acrylic):</strong> starting at $200
          <br />
          <strong>Digital illustration:</strong> starting at $50
          <br />
          <strong>Character design:</strong> starting at $75
        </ContactItem>
        <ContactItem>
          DM me on twitter or email me for inquiries~ please include reference
          images if you have them! ♥
        </ContactItem>
      </CommissionBox>

      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>
      <ContactItem style={{ textAlign: "center", fontSize: 11 }}>
        i try to respond within 48 hours! please be patient with me~ (´・ω・`)
      </ContactItem>
    </Wrapper>
  );
}
