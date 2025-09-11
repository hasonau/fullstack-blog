import PostListItem from "./PostListItem";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";

const fetchPosts = async (pageParam, searchParams) => {
    const searchParamsObj = Object.fromEntries([...searchParams]);

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
        params: { page: pageParam, limit: 10, ...searchParamsObj },
    });

    return res.data;
};

// temporary mock data (remove later when backend works)
const mockPosts = [
    { _id: "1", title: "First dummy post", content: "This is placeholder content." },
    { _id: "2", title: "Second dummy post", content: "More placeholder content." },
];

const PostList = () => {
    const [searchParams] = useSearchParams();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useInfiniteQuery({
        queryKey: ["posts", searchParams.toString()],
        queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) =>
            lastPage?.hasMore ? pages.length + 1 : undefined,
        enabled: !!import.meta.env.VITE_API_URL, // prevent running if API not ready
    });

    if (isFetching) return "Loading...";
    if (error) return "Something went wrong!";

    const allPosts = data?.pages?.flatMap((page) => page.posts) || mockPosts;

    return (
        <InfiniteScroll
            dataLength={allPosts.length}
            next={fetchNextPage || (() => { })}
            hasMore={!!hasNextPage}
            loader={<h4>Loading more posts...</h4>}
            endMessage={
                <p>
                    <b>All posts loaded!</b>
                </p>
            }
        >
            {allPosts.map((post, i) => (
                <PostListItem key={post?._id || i} post={post} />
            ))}
        </InfiniteScroll>
    );
};

export default PostList;
