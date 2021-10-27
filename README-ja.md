# リリースパッケージ作成方法

## [Apache Ant](https://ant.apache.org/) を使ってビルド

- リリースバージョンを書き換える

      build.properties の 1 行目:
      dist=release/confirm-address_x.y.z-tb.xpi

      confirm-address/manifest.json の 5 行目:
      "version": "x.y.z",

- ant を実行する
- release 以下にリリースパッケージが生成される

## 手作業でビルド

- confirm-address フォルダー内ソースファイルすべてを zip ファイルで圧縮します
- 作成された zip ファイルを以下の例に従ってファイル名を変更します  
  (例：confirm-address.zip -> confirm-address_1.3.8-tb.xpi)  
  ※confirm-address のフォルダーから zip ファイルを作成した場合アドオンとして読み込むことができません

# 開発方法

- GitHub からソースファイル一式をクローンします
- [≡]-> [🧩 アドオンとテーマ] -> [⚙️]ボタンをクリックして[アドオンをデバッグ]を選択します
- [一時的なアドオンを読み込む...]をクリックして confirm-address/manifest.json を選択します

Confirm-Address の[調査]ボタンを押すとツールボックスが別タブで表示されます

- ソース中に `console.log("foo");` のように記述するとコンソールに"foo"と表示されます
- 同様に`console.dir(foo);` のように記述すると foo 変数の内容が一覧表示されます

※ソースファイルを書き換えた後、内容を有効にするにはデバッガータブから[再読み込み]をクリックしてください

## 単体テストの実行/作成方法

### 実行方法

- confirm-address/scripts/unittest/testRunner.html を Web ブラウザーで開くと単体テストが実行されます
- テスト成功なら、`OK ... (テスト名)`と表示されます
- 失敗なら、`NG ... (テスト名)`に続けて失敗理由を表すメッセージが表示されます

### 作成方法

#### 例： /scripts/hello.js をテストする場合

- テストケース js ファイルとして /scripts/unittest/hello-test.js を作成します
- testRunner.html に、上記二つの js ファイル を`<script>`を使ってインクルードします

        <head>
            <script type="text/javascript" src="../hello.js"></script>
            <script type="text/javascript" src="hello-test.js"></script>
            <!-- Tests start -->
            ...

- hello.js には、メソッド名が test から始まるテストメソッドを定義し、その中で hello.js のメソッドなどを呼び出して、テストを記述します
- テストコード内では、assertEquals メソッドが使えます
