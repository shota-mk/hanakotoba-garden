# VOCO お役立ち記事 No.035〜039（レビュー待ち）

voco.co.jp のお役立ち記事（AEO：AI検索で引用される記事）の第1週分の下書きです。公開はしていません。

- `out/No.0xx_article.html` … 記事の正本。Tainen/Claude-Code の `content/articles/out/` と同じ形式です（先頭コメントに掲載用メタ情報と FAQPage JSON-LD）。
- 2026-10-02 の「文章が短すぎる」という指示を受けて書き直しました。5本とも `tools/article/check-article.mjs --target 3300` で合格しています（3,038〜3,200字）。
- 一次情報は、Drive「確認前」フォルダにある既存記事（No.001〜034）と knowledge.md に書かれた、VOCO の数字と運用ルールだけです。出典の記事番号は、各記事のメタ情報「一次情報」に書いています。
- 画像：クラウドでの自動生成はやめました。画像は Gemini で手作業で作ります。プロンプトは `image-prompts.md` にあります（各記事3枚、計15本）。Google ドキュメントでは「画像1」「画像2」「画像3」と書いた位置に入れます。

このリポジトリは、記事生成の本来の置き場所（Tainen/Claude-Code）ではありません。このセッションから Tainen/Claude-Code へは push できなかったため、ここに置いています。Tainen/Claude-Code の `content/articles/out/` にそのままコピーすれば使えます。
