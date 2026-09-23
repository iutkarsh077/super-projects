const API_URL = "http://localhost:5000/api/analyze";

const analyzedPosts = new WeakSet();

function getPostText(article) {
  const elements = article.querySelectorAll(
    '[data-testid="tweetText"]'
  );

  return Array.from(elements)
    .map((element) => element.innerText)
    .join("\n")
    .trim();
}

function createBadge(result) {
  const badge = document.createElement("div");

  const isSlop =
    result?.ai_slop?.noul >= 0.5;

  const score =
    result?.slop_score?.score ?? 0;

  badge.className = "jev-slop-badge";

  badge.innerHTML = `
    <span class="jev-dot"></span>
    <span>
      ${isSlop ? "AI Slop Signal" : "Looks Human"}
    </span>
    <span class="jev-score">
      ${score}/5
    </span>
  `;

  return badge;
}

async function analyzeArticle(article) {
  if (analyzedPosts.has(article)) {
    return;
  }

  const text = getPostText(article);

  if (!text || text.length < 30) {
    return;
  }

  analyzedPosts.add(article);

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        text,
      }),
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (!data.result) {
      return;
    }

    const existing =
      article.querySelector(".jev-slop-badge");

    if (existing) {
      existing.remove();
    }

    const badge = createBadge(data.result);

    const tweetContent =
      article.querySelector('[data-testid="tweetText"]');

    if (tweetContent) {
      tweetContent.parentElement.appendChild(badge);
    }

  } catch (error) {
    console.error("Jev:", error);
  }
}

function scanTweets() {
  const articles =
    document.querySelectorAll(
      'article[data-testid="tweet"]'
    );

  articles.forEach(analyzeArticle);
}

const observer = new MutationObserver(() => {
  scanTweets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

scanTweets();