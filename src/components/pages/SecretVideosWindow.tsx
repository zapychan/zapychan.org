import styled from "styled-components";
import { Anchor, Frame } from "react95";
import { videos } from "../../data/videos";

const Wrapper = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const Title = styled.h2`
  color: #ff1493;
  margin: 0 0 8px 0;
  font-size: 18px;
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 11px;
  margin: 0 0 16px 0;
  color: #d4578a;
`;

const VideoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VideoCard = styled(Frame)`
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const VideoThumb = styled.img`
  width: 120px;
  height: 68px;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #ff69b4;
`;

const VideoInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const VideoTitle = styled.div`
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
  color: #8b0045;
`;

const VideoDesc = styled.div`
  font-size: 11px;
  color: #d4578a;
`;

export function SecretVideosWindow() {
  return (
    <Wrapper>
      <Title>🎬 Secret Videos!! 🎬</Title>
      <Subtitle>
        ~*~ you found the secret stash!! don't tell anyone~ ~*~
      </Subtitle>
      <VideoList>
        {videos.map((video) => (
          <Anchor
            key={video.id}
            href={video.url}
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <VideoCard variant="well">
              <VideoThumb
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
              />
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                <VideoDesc>{video.description}</VideoDesc>
              </VideoInfo>
            </VideoCard>
          </Anchor>
        ))}
      </VideoList>
    </Wrapper>
  );
}
