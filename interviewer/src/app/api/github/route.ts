"use server";

import { prisma } from "@/lib/prisma";
import { CheckGithubType, GitHubRepository } from "@/typeChecker/GithubChecker";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { success, data } = CheckGithubType.safeParse(body);


        if (!success) {
            return NextResponse.json(
                { message: 'User created successfully' },
                { status: 201 }
            );
        }

        const githubUserName = data.githubUrl.split("/").pop();
        const res = await axios.get(`https://api.github.com/users/${githubUserName}/repos`)
        const githubInfo = res.data.map((item: GitHubRepository) => (
            {
                name: item.name,
                description: item.description,
                stars: item.stargazers_count,
            }

        ))

        const saveData = await prisma.interview.create({
            data: {
                githubMetaData: githubInfo
            }
        })

        return NextResponse.json(
            { message: 'User created successfully', data: saveData.id },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}