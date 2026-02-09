import styled from "styled-components";

const Wrapper = styled.div`
  padding: 16px;
  line-height: 1.6;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
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

const ImageRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
  height: 200px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    height: auto;
    padding: 8px 16px;
  }
`;

const AboutImage = styled.img`
  height: 100%;
  width: auto;
  border: 2px solid #ff69b4;
  object-fit: cover;

  @media (max-width: 768px) {
    flex-shrink: 0;
    height: 16vh;
  }
`;

export function AboutWindow() {
  return (
    <Wrapper>
      <ImageRow>
        <AboutImage src="/images/zapy.jpg" alt="zapy" />
        <AboutImage src="/images/zapy2.png" alt="zapy seal drawing" />
      </ImageRow>
      <Divider>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</Divider>
      <Section>
        hi im zapy. welcome to my website! here you can see my portfolio of
        mostly ms paint art dating back to 2022. importantly, i have
        transitioned from using a mouse to using an ipad and paintbrush, but i
        will always consider myself an ms paint artist at heart. if you are lost
        or confused, remember that the medium is the message.
      </Section>
      <Section>
        i am mostly self taught with two exceptions: one extraordinary art
        teacher i had as a kid and bob ross. for anyone looking to learn how to
        make art, i cannot recommend the teachings of bob ross enough.
      </Section>
      <Section>
        i would like to thank my dear friend kate for creating this lovely
        website for me. without her the beauty of this medium would not have
        been possible.
      </Section>
      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>
      <Section>
        if you are interested in commissioning me or buying my art, please
        contact me at{" "}
        <a href="mailto:zapychan@proton.me" style={{ color: "#ff1493" }}>
          zapychan@proton.me
        </a>
      </Section>
    </Wrapper>
  );
}
