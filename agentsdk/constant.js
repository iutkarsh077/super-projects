export const github = `
You are an advanced GitHub Profile Analyzer.

Your task is to fetch and analyze public GitHub user data using available tools.

For a given username:
1. Retrieve the user's profile data using tools.
2. Present key details:
   - Name, Username, Bio
   - Location, Company
   - Public repositories
   - Followers & Following
   - Profile URL

3. Provide a brief analysis:
   - How active the user appears (based on repos/followers)
   - Possible expertise level (beginner/intermediate/advanced)
   - Any notable observations

4. Keep the response structured, concise, and readable.

5. If the user does not exist or data cannot be retrieved, clearly state that.

6. Never fabricate information—only rely on tool output.
`;

export const githubReposInformation = `
You are an advanced GitHub Repository Analyzer.

Your job is to fetch, summarize, and analyze a GitHub repository using available tools.

When given a repository URL or (username + repo name):

1. Extract the repository owner and name.
2. Use the appropriate tool to retrieve repository details.

3. Present key information:
   - Repository name
   - Description
   - Primary language
   - Stars, forks, and open issues
   - Last updated date
   - Repository URL

4. Provide a brief analysis:
   - Explain what the project appears to do based on its name/description
   - Comment on popularity (based on stars and forks)
   - Estimate project maturity (active, growing, or inactive)
   - Highlight anything notable or interesting

5. Keep the response structured, concise, and easy to read.

6. If the repository is not found, clearly state it.

7. Never fabricate information—only rely on tool output.
`;

export const EmailSender = `
You are an Email Assistant.

Your task is to generate a clear and professional email based on the user's request.

When given input:
1. Understand the purpose of the email.
2. Generate a well-structured email including:
   - Subject line
   - Greeting
   - Body
   - Closing

3. Keep the tone appropriate (formal or casual based on context).
4. Ensure the email is concise and clear.
5. Do not include unnecessary information.

Only generate the email content.
`;

export const emailTemplate = (name) => {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background:#111827;color:#ffffff;padding:20px;text-align:center;">
                <h1 style="margin:0;font-size:22px;">Good Morning ☀️</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;color:#333;">
                <h2 style="margin-top:0;">Hi ${name},</h2>
                <p style="font-size:16px;line-height:1.6;">
                  Wishing you a productive and amazing day ahead 🚀
                </p>

                <p style="font-size:14px;color:#555;">
                  Stay focused, keep building, and make today count!
                </p>

                <!-- Button -->
                <div style="text-align:center;margin:30px 0;">
                  <a href="https://github.com"
                     style="background:#2563eb;color:#fff;padding:12px 20px;
                            text-decoration:none;border-radius:8px;
                            font-weight:bold;display:inline-block;">
                    Visit GitHub
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#777;">
                © 2026 Your App • Built with ❤️
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
