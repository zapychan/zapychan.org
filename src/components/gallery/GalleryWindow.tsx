import { useMemo, useState } from "react";
import styled from "styled-components";
import { Toolbar, Button } from "react95";
import { Mspaint, Pbrush1 } from "@react95/icons";
import { paintings } from "../../data/paintings";
import { digitalWorks } from "../../data/digitalWorks";
import { ipadWorks } from "../../data/ipadWorks";
import { gifWorks } from "../../data/gifWorks";
import { selfPortraits } from "../../data/selfPortraits";
import { GalleryGrid } from "./GalleryGrid";

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
  text-align: right;
  color: #ff1493;
  font-size: 11px;
  padding: 4px 0;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

export function GalleryWindow({ windowId, props }: GalleryWindowProps) {
  const galleryType = (props?.galleryType as string) || "paintings";
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");
  const artworks = useMemo(() => {
    if (galleryType === "paintings") return paintings;
    if (galleryType === "ipad") return ipadWorks;
    if (galleryType === "gif") return gifWorks;
    if (galleryType === "selfPortraits") return selfPortraits;
    return digitalWorks;
  }, [galleryType]);

  const titleMap: Record<string, React.ReactNode> = {
    paintings: <><Pbrush1 variant="32x32_4" width={14} height={14} /> My Paintings</>,
    mspaint: <><Mspaint variant="16x16_4" width={14} height={14} /> MS Paint Art</>,
    ipad: <><Pbrush1 variant="32x32_4" width={14} height={14} /> iPad Art</>,
    gif: <><Pbrush1 variant="32x32_4" width={14} height={14} /> GIFs</>,
    selfPortraits: <><Pbrush1 variant="32x32_4" width={14} height={14} /> Self Portraits</>,
  };
  const title = titleMap[galleryType] ?? <><Pbrush1 variant="32x32_4" width={14} height={14} /> Gallery</>;

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
          {title} ({artworks.length} works)
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
