import { useMemo, useState } from "react";
import styled from "styled-components";
import { Toolbar, Button } from "react95";
import { paintings } from "../../data/paintings";
import { digitalWorks } from "../../data/digitalWorks";
import { GalleryGrid } from "./GalleryGrid";
import { useEvilMode } from "../../hooks/useEvilMode";

export type SortOrder = "oldest" | "newest";

interface GalleryWindowProps {
  windowId: string;
  props?: Record<string, unknown>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const GalleryToolbar = styled(Toolbar)`
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  padding: 4px;
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
`;

const Title = styled.div`
  text-align: center;
  color: #ff1493;
  font-size: 11px;
  padding: 4px 0;
  font-weight: bold;
`;

export function GalleryWindow({ windowId, props }: GalleryWindowProps) {
  const galleryType = (props?.galleryType as string) || "paintings";
  const { isEvil } = useEvilMode();
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");
  const artworks = useMemo(
    () => (galleryType === "paintings" ? paintings : digitalWorks),
    [galleryType],
  );

  const visibleCount = artworks.filter((a) => isEvil || !a.evilOnly).length;
  const title =
    galleryType === "paintings" ? "🎨 My Paintings" : "💻 Digital Works";

  const toggleSort = () =>
    setSortOrder((prev) => (prev === "oldest" ? "newest" : "oldest"));

  return (
    <Wrapper>
      <GalleryToolbar>
        <Button variant="thin" size="sm" disabled>
          View
        </Button>
        <Button
          variant="thin"
          size="sm"
          active={sortOrder === "newest"}
          onClick={toggleSort}
        >
          Sort: {sortOrder === "oldest" ? "Oldest" : "Newest"}
        </Button>
        <Title style={{ flex: 1 }}>
          {title} ({visibleCount} works)
        </Title>
      </GalleryToolbar>
      <ContentArea>
        <GalleryGrid
          artworks={artworks}
          windowId={windowId}
          sortOrder={sortOrder}
        />
      </ContentArea>
    </Wrapper>
  );
}
