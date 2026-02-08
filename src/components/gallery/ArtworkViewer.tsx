import styled from "styled-components";
import { Frame } from "react95";
import type { Artwork } from "../../data/paintings";

interface ArtworkViewerProps {
  windowId: string;
  props?: Record<string, unknown>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const ImageContainer = styled.div`
  max-width: 100%;
  max-height: 60vh;
  overflow: hidden;
  border: 3px solid #ff69b4;

  img {
    max-width: 100%;
    max-height: 60vh;
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
  max-width: 500px;
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
          <strong>Year:</strong> {artwork.year}
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
