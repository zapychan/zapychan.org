import styled from "styled-components";
import { Anchor } from "react95";

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

const LinkSection = styled.div`
  margin: 12px 0;
`;

const SectionTitle = styled.h3`
  color: #ff1493;
  font-size: 14px;
  margin: 0 0 8px 0;
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LinkItem = styled.li`
  font-size: 13px;
  &::before {
    content: "✿ ";
    color: #ff69b4;
  }
`;

export function LinksWindow() {
  return (
    <Wrapper>
      <Title>🔗 Cool Links 🔗</Title>
      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>

      <LinkSection>
        <SectionTitle>~*~ Art Friends ~*~</SectionTitle>
        <LinkList>
          <LinkItem>
            <Anchor href="https://www.deviantart.com" target="_blank">
              DeviantArt
            </Anchor>{" "}
            - where it all started~
          </LinkItem>
          <LinkItem>
            <Anchor href="https://www.pixiv.net" target="_blank">
              Pixiv
            </Anchor>{" "}
            - amazing art community
          </LinkItem>
          <LinkItem>
            <Anchor href="https://www.artstation.com" target="_blank">
              ArtStation
            </Anchor>{" "}
            - professional portfolios
          </LinkItem>
        </LinkList>
      </LinkSection>

      <Divider>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</Divider>

      <LinkSection>
        <SectionTitle>~*~ Cool Stuff ~*~</SectionTitle>
        <LinkList>
          <LinkItem>
            <Anchor href="https://www.cameronsworld.net" target="_blank">
              Cameron's World
            </Anchor>{" "}
            - geocities preserved ♥
          </LinkItem>
          <LinkItem>
            <Anchor href="https://poolsuite.net" target="_blank">
              Poolsuite FM
            </Anchor>{" "}
            - vibes for painting
          </LinkItem>
          <LinkItem>
            <Anchor href="https://neal.fun" target="_blank">
              neal.fun
            </Anchor>{" "}
            - fun internet stuff!
          </LinkItem>
        </LinkList>
      </LinkSection>

      <Divider>♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥</Divider>

      <LinkSection>
        <SectionTitle>~*~ Resources ~*~</SectionTitle>
        <LinkList>
          <LinkItem>
            <Anchor href="https://color.adobe.com" target="_blank">
              Adobe Color
            </Anchor>{" "}
            - color palette inspo
          </LinkItem>
          <LinkItem>
            <Anchor href="https://www.posemaniacs.com" target="_blank">
              Posemaniacs
            </Anchor>{" "}
            - figure drawing practice
          </LinkItem>
        </LinkList>
      </LinkSection>
    </Wrapper>
  );
}
