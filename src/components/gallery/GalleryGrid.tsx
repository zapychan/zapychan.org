import { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { Button } from "react95";
import type { Artwork } from "../../data/types";
import type { SortOrder } from "./GalleryWindow";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useIsMobile } from "../../hooks/useIsMobile";

interface GalleryGridProps {
  artworks: Artwork[];
  windowId: string;
  sortOrder: SortOrder;
}

const PAGE_SIZE = 20;

const Grid = styled.div<{ $isMobile: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ $isMobile }) => ($isMobile ? "120px" : "150px")}, 1fr));
  gap: 12px;
  padding: 4px;
  align-items: start;
`;

const ThumbCard = styled.div`
  cursor: pointer;
  text-align: center;
  min-width: 0;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.02);
  }
`;

const ThumbImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: #ffe4f0;
  border: 2px solid #ff69b4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 40px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbTitle = styled.div`
  font-size: 14px;
  margin-top: 6px;
  color: #8b0045;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThumbYear = styled.div`
  font-size: 12px;
  color: #d4578a;
`;

const LoadMoreWrapper = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 16px 0;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 16px;
  color: #d4578a;
  font-size: 14px;
`;

// Placeholder emoji for missing images
const placeholderEmojis = ["🎨", "🖼️", "✨", "🌸", "💖", "🦋"];

function getDateKey(a: Artwork): string {
  return a.date || `${a.year}-01-01`;
}

export function GalleryGrid({
  artworks,
  sortOrder,
}: GalleryGridProps) {
  const [page, setPage] = useState(1);
  const { openWindow } = useWindowManager();
  const isMobile = useIsMobile();

  const visibleWorks = useMemo(() => {
    const sorted = [...artworks].sort((a, b) => {
      const da = getDateKey(a);
      const db = getDateKey(b);
      return sortOrder === "oldest"
        ? da.localeCompare(db)
        : db.localeCompare(da);
    });
    return sorted;
  }, [artworks, sortOrder]);

  const displayedWorks = useMemo(
    () => visibleWorks.slice(0, page * PAGE_SIZE),
    [visibleWorks, page],
  );

  const hasMore = displayedWorks.length < visibleWorks.length;

  const handleClick = useCallback(
    (artwork: Artwork) => {
      openWindow(
        `artwork-${artwork.id}`,
        artwork.title,
        "artworkViewer",
        { artwork },
      );
    },
    [openWindow],
  );

  if (visibleWorks.length === 0) {
    return (
      <Grid $isMobile={isMobile}>
        <EmptyState>No artworks to display yet~ check back soon! ♥</EmptyState>
      </Grid>
    );
  }

  return (
    <Grid $isMobile={isMobile}>
      {displayedWorks.map((artwork, i) => (
        <ThumbCard key={artwork.id} onClick={() => handleClick(artwork)}>
          <ThumbImage>
            <img
              src={artwork.thumbnail}
              alt={artwork.title}
              loading="lazy"
              onError={(e) => {
                // Replace broken images with emoji placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.textContent =
                    placeholderEmojis[i % placeholderEmojis.length] ?? "🎨";
                }
              }}
            />
          </ThumbImage>
          <ThumbTitle>{artwork.title}</ThumbTitle>
          <ThumbYear>{artwork.date || artwork.year}</ThumbYear>
        </ThumbCard>
      ))}
      {hasMore && (
        <LoadMoreWrapper>
          <Button onClick={() => setPage((p) => p + 1)}>
            Load More ♥
          </Button>
        </LoadMoreWrapper>
      )}
    </Grid>
  );
}
