import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const UserDetailApi = createApi({
    reducerPath: "userinfo",

    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000",
        credentials: "include"
    }),

    endpoints: (builder) => ({
        getuserinfo: builder.query({
            query: () => "/getusers"
        })
    })
})


export const { useGetuserinfoQuery } = UserDetailApi
export default UserDetailApi;