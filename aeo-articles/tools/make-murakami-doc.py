import re,sys
no,nth,branch_html,prompts,out=sys.argv[1:6]
COMMON='写真のようにリアルな、報道写真風の画像。日本の採用コンサル会社のブログ記事に載せます。自然な窓の光、20〜50代のリアルな日本人、仕事中の自然な一瞬、背景は少しぼかす、横長16:9。文字・数字・ロゴ・看板・透かしは一切入れない（紙は白紙か簡単なグラフと線だけ、パソコンやスマートフォンの画面は抽象的な図形だけ、ホワイトボードやカレンダーには何も書かない）。実在の人物や有名人は描かない。落ち着いた色味の、すっきりした現代的な雰囲気。オレンジ色の小物をひとつだけ控えめに入れる（ファイル、ネックストラップ、椅子など）。'
s=open(branch_html).read()
ps=[l.strip().split('写真のようにリアルな、報道写真風の画像。')[0] for l in open(prompts) if l.strip()]
k=[0]
def rep(m):
    i=k[0]; k[0]+=1; n=i+1
    return (f'<p style="text-align:center;color:#6B6B6B">画像{n}</p>\n'
            f'<p style="color:#6B6B6B;font-size:10pt">画像{n}のプロンプト（Gemini に貼る。Studio に貼るときはこの段落を消す）：{ps[i]}{COMMON}</p>')
s=re.sub(r'<img [^>]*><p[^>]*>【画像\d+：[^<]*</p>',rep,s)
assert k[0]==3==len(ps),(k[0],len(ps))
s=re.sub(r'<title>No\.\d+ ','<title>村上作　',s)
s=re.sub(r'<p>記事番号：[^<]*</p>',f'<p>記事番号：未定（村上作 {nth}本目。公開時に番号とスラッグを振る）</p>',s)
s=re.sub(r'<p>画像：本文中の[^<]*</p>','<p>画像：本文中の「画像1」〜「画像3」の位置に、すぐ下のプロンプトで Gemini に作らせた画像を貼る。Studio に貼るときはプロンプトの段落を消す。Studio には Doc 内の画像を保存して入れる</p>',s)

# よくある質問：Q.（オレンジ）と質問を灰色の帯、A. と回答を白い帯に分けた表にする（村上さん指定の形 2026-10-18）
def faq(m):
    q=re.sub(r'<[^>]+>','',m.group(1)); a=m.group(2)
    return ('<table style="width:100%;border-collapse:collapse;border:1px solid #E5E5E5"><col width="48"><col>'
            f'<tr><td style="background-color:#EEEEEE;color:#F15A24;font-weight:bold;padding:10px">Q.</td><td style="background-color:#EEEEEE;font-weight:bold;padding:10px">{q}</td></tr>'
            f'<tr><td style="background-color:#FFFFFF;font-weight:bold;padding:10px">A.</td><td style="background-color:#FFFFFF;padding:10px">{a}</td></tr></table>\n<p></p>')
s=re.sub(r'<h3[^>]*>(.*?)</h3>\s*<p>(.*?)</p>',faq,s)
s=re.sub(r'(<p>太字：[^<]*</p>)',r'\1\n<p>よくある質問：Q.（質問）と A.（回答）の形。Studio のよくある質問（開閉式）に、質問と回答をそれぞれ入れる。「Q.」「A.」の文字は Studio 側で付くので、表の右側の文だけを貼る</p>',s)
s=s.replace('<p>【村上さんに確認：','<p style="color:#C00000;background-color:#FFF0F0">【村上さんに確認：')
assert 'raw.githubusercontent' not in s and '<img' not in s
open(out,'w').write(s)
print(out, len(s))
