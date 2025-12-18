import axios, { type AxiosResponse } from "axios";


export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;

  type: "User";
  user_view_type: "public";
  site_admin: boolean;

  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;

  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;

  created_at: string; 
  updated_at: string; 
}


const getUserDetails = async (username: string) =>{
    try {
        const response: AxiosResponse<GitHubUser> = await axios.get(`https://api.github.com/users/${username}`);
        console.log(response.data);
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log(error.message);
        }
    }
}

getUserDetails("iutkarsh077")