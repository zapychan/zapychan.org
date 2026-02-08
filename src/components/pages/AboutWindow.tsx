import styled from "styled-components";

const Wrapper = styled.div`
  padding: 16px;
  line-height: 1.6;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const Title = styled.h2`
  color: #ff1493;
  margin: 0 0 12px 0;
  font-size: 18px;
`;

const Divider = styled.div`
  text-align: center;
  margin: 12px 0;
  font-size: 10px;
  color: #ff69b4;
  letter-spacing: 4px;
`;

const Section = styled.p`
  margin: 8px 0;
  font-size: 13px;
`;

export function AboutWindow() {
  return (
    <Wrapper>
      <Title>~*~ About zapychan ~*~</Title>
      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>
      <Section>
        hi!! im zapychan and this is my little corner of the internet~ ♥
      </Section>
      <Section>
        i'm an artist who loves painting and digital art! i've been making art
        for as long as i can remember and i love creating colorful, expressive
        pieces that make people feel something~
      </Section>
      <Section>
        when i'm not painting, you can find me exploring new digital art techniques,
        collecting cute stickers, and drinking way too much boba tea 🧋
      </Section>
      <Divider>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</Divider>
      <Section>
        <strong>Fun facts:</strong>
        <br />
        ✿ favorite color: pink (obviously lol)
        <br />
        ✿ favorite medium: oil paint + procreate
        <br />
        ✿ favorite snack: strawberry pocky
        <br />
        ✿ favorite music: city pop + shoegaze
      </Section>
      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>
      <Section style={{ textAlign: "center", fontSize: 11 }}>
        thanks for visiting my site!! (ﾉ◕ヮ◕)ﾉ*:・゚✧
      </Section>
    </Wrapper>
  );
}
