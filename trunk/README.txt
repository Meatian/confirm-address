==リリースパッケージ作成方法

[antを使ってビルド]
-build.propertiesを、リリースバージョンに合わせて書き換える
-antを実行する
-release以下にリリースパッケージが生成される

[手作業でビルド]
-ソースをzipで固めてバージョンに合わせて名前を変更するだけです

==開発方法

-svnからソース一式をダウンロードします。
-trunk以下のフォルダのパスを、テキストファイルに書きます。
-そのテキストファイルを「confirm-address@kenmaz.net」というファイル名で保存します。
-TBのextensionsフォルダに、上記ファイルをおきます

ファイルの内容はこんな感じ
-----
/Users/ken/Coding/confirm-address-svn/trunk/confirm-address
-----

TBを起動すれば、動作を確認しながらコーディングできます
