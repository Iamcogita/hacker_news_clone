const newsArticle = require('./model.js');

const algolia = "https://hn.algolia.com/api/v1/search?hitsPerPage=30";

async function APIfetcher(url) {
    return await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            let news = [];
            json.hits.forEach(e => {
                if (e.title !== null) {
                    news.push(new newsArticle(
                        e.title,
                        e.url,
                        e.objectID,
                    ))
                }
            });
            return news;
        });
}

async function fetchComments(id) {
    const response = await fetch(`http://hn.algolia.com/api/v1/items/${id}`);
    const json = await response.json();
    let comArr = [];
    json.children.map(e => comArr.push(e.text));
    return comArr;
}

function printNews(news) {
    const main = document.getElementsByTagName("main")[0];
    const div = document.createElement("div");
    div.classList.add("news-container")

    for (const article of news) {
        const td = document.createElement("td");
        td.setAttribute("class", "alignR");
        const table = document.createElement("table");
        const anchor = document.createElement("a");
        anchor.setAttribute("href", article.url);
        anchor.setAttribute("target", "_blank");
        anchor.innerText = " #  " + article.title.toUpperCase();

        const button = document.createElement("button");
        button.innerHTML = 'COMMENTS';
        button.addEventListener("click", async () => {
            const commentID = "comments-".concat(article.objectID)
            if (!document.getElementById(commentID)) {
                const comDiv = document.createElement("div");
                comDiv.classList.add("comments");
                table.after(comDiv);
                comDiv.innerText = "LOADING";
                const comments = await fetchComments(article.objectID);
                comDiv.innerText = "";
                comments.forEach(it => {
                    const newDiv = document.createElement("div")
                    newDiv.innerHTML = "<hr/>" + it;
                    comDiv.append(newDiv);
                })
                comDiv.setAttribute("id", commentID);
            } else {
                document.getElementById(commentID).remove();
            }
        });

        td.appendChild(button);
        table.appendChild(anchor);
        div.appendChild(table);
        table.appendChild(td);
    }
    main.appendChild(div);
}

APIfetcher(algolia).then(printNews);