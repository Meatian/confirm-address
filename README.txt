==リリースパッケージ作成方法

[antを使ってビルド]
-build.propertiesを、リリースバージョンに合わせて書き換える
-install.rdfを、リリースバージョンに合わせて書き換える
-antを実行する
-release以下にリリースパッケージが生成される

[手作業でビルド]
-ソースをzipで固めてバージョンに合わせて名前を変更するだけです

==開発方法

-svnからソース一式をダウンロードします。
-trunk以下のフォルダのパスを、テキストファイルに書きます。
-そのテキストファイルを「confirm-address@kenmaz.net」というファイル名で保存します。
-TBのextensionsフォルダに、上記ファイルをおきます
-MacOSXの場合は以下のパスにァイルを作ります 
----
 ~/Library/Thunderbird/Profiles/snlxbw06.default/extensions/confirm-address@kenmaz.net
----

ファイルの内容はこんな感じ
-----
/Users/ken/Coding/confirm-address-svn/trunk/confirm-address
-----

TBを起動すれば、動作を確認しながらコーディングできます

==デバッグ出力方法

-Profileフォルダにuser.jsというファイルを作り、以下の一行を追加します
---------
user_pref("browser.dom.window.dump.enabled",true);
---------
-ソース中にdump("hoge");のように記述します
-起動時オプション"-console"をつけてTBを起動します。
 Macの場合は、以下のように起動します。
-------
> /Applications/Thunderbird.app/Contents/MacOS/thunderbird-bin -console
-------
-コンソールに"hoge"と表示されます

==単体テストの実行/作成方法

===実行方法
-confirm-address/chrome/content/unittest/testRunner.htmlをwebブラウザで開けば
 単体テストを実行できます。
-テスト成功なら、「N test success!!」というダイアログが表示されます
-失敗なら、失敗理由を表すメッセージがダイアログ表示されます。

===作成方法
-たとえば/chrome/content/hello.js をテストしたいとします。
-/chrome/content/unittest/hello-test.jsを作成します.
-testRunner.htmlに、上記二つのjsを<script>を使ってインクルードします.
-hello.jsには、メソッド名がtestから始まるテストメソッドを定義し、その中でhello.jsのメソッドなどを呼び出して、テストを記述します。
-テストコード内では、assertEqualsメソッドが使えます。

-テストコードでは、メソッド名がtestからはじまるグローバルなメソッドを定義します。

