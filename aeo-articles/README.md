# VOCO お役立ち記事 No.035〜039（レビュー待ち）

voco.co.jp のお役立ち記事（AEO：AI検索で引用される記事）の第1週分の下書きです。公開はしていません。

- `out/No.0xx_article.html` … 記事の正本。Tainen/Claude-Code の `content/articles/out/` と同じ形式です（先頭コメントに掲載用メタ情報と FAQPage JSON-LD）。
- 2026-10-02 の「文章が短すぎる」という指示を受けて書き直しました。5本とも `tools/article/check-article.mjs --target 3300` で合格しています（3,038〜3,200字）。
- 一次情報は、Drive「確認前」フォルダにある既存記事（No.001〜034）と knowledge.md に書かれた、VOCO の数字と運用ルールだけです。出典の記事番号は、各記事のメタ情報「一次情報」に書いています。
- 画像：以前のフラットイラストは、品質が足りないため削除しました。写真調の画像は、`GEMINI_API_KEY`（課金を有効にしたキー）を設定した新しいセッションで作ります。作り方は Tainen/Claude-Code で `node tools/article/make-images-from-article.mjs No.035 No.036 No.037 No.038 No.039 --force` です。記事中の【画像：…】に、それぞれの場面説明を書いています。

このリポジトリは、記事生成の本来の置き場所（Tainen/Claude-Code）ではありません。このセッションから Tainen/Claude-Code へは push できなかったため、ここに置いています。Tainen/Claude-Code の `content/articles/out/` にそのままコピーすれば使えます。
