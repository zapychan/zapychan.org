import styled from "styled-components";
import { Frame } from "react95";
import type { Artwork } from "../../data/types";

interface ArtworkViewerProps {
  windowId: string;
  props?: Record<string, unknown>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    min-width: 100%;
    min-height: 100%;
    max-width: 100%;
    max-height: 100%;
    display: block;
    object-fit: contain;
  }
`;

const PlaceholderImage = styled.div`
  width: 300px;
  height: 300px;
  background: #ffe4f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
`;

const InfoBox = styled(Frame)`
  padding: 12px;
  width: 100%;
  flex-shrink: 0;
`;

const Title = styled.h2`
  color: #ff1493;
  margin: 0 0 8px 0;
  font-size: 16px;
`;

const MetaRow = styled.div`
  font-size: 12px;
  margin: 4px 0;
  color: #8b0045;

  strong {
    color: #ff1493;
  }
`;

const Description = styled.p`
  font-size: 12px;
  margin: 8px 0 0 0;
  color: #8b0045;
  line-height: 1.5;
  font-style: italic;
`;

export function ArtworkViewer({ props }: ArtworkViewerProps) {
  const artwork = props?.artwork as Artwork | undefined;

  if (!artwork) {
    return (
      <Wrapper>
        <PlaceholderImage>❓</PlaceholderImage>
        <p>Artwork not found!</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <ImageContainer>
        <img
          src={artwork.fullImage}
          alt={artwork.title}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<div style="width:300px;height:300px;background:#ffe4f0;display:flex;align-items:center;justify-content:center;font-size:64px">🖼️</div>';
          }}
        />
      </ImageContainer>

      <InfoBox variant="well">
        <Title>{artwork.title}</Title>
        <MetaRow>
          <strong>Date:</strong> {artwork.date || artwork.year}
        </MetaRow>
        <MetaRow>
          <strong>Medium:</strong> {artwork.medium}
        </MetaRow>
        {artwork.dimensions && (
          <MetaRow>
            <strong>Dimensions:</strong> {artwork.dimensions}
          </MetaRow>
        )}
        {artwork.description && (
          <Description>"{artwork.description}"</Description>
        )}
      </InfoBox>
    </Wrapper>
  );
}
