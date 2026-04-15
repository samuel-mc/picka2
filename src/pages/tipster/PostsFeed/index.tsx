import { TipsterLayout } from "@/layouts/TipsterLayout";
import { PostsFeedScreen } from "@/components/posts/PostsFeedScreen";

interface PostsFeedPageProps {
  mode?: "feed" | "saved";
}

export default function PostsFeedPage({ mode = "feed" }: PostsFeedPageProps) {
  return (
    <TipsterLayout isFixed={false}>
      <PostsFeedScreen mode={mode} />
    </TipsterLayout>
  );
}
