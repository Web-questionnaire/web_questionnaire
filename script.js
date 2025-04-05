$(document).ready(function() {
    window.scrollTo(0, 0);

    // 横スクロールバーを非表示にするためのスタイルを追加
    const preventHorizontalScrollStyle = `
        <style>
            #chatMessages, .message, .message-content, .options, .text-input-container, .vas-container, #resultSection {
                max-width: 100%;
                word-wrap: break-word;
                overflow-x: hidden;
            }
            .message-content {
                white-space: normal;
            }
            body, html {
                overflow-x: hidden;
            }
            .text-input {
                max-width: 100%;
                box-sizing: border-box;
            }
            #qrcode, #mailContainer {
                max-width: 100%;
                overflow-x: hidden;
            }
            #resultMessage {
                max-width: 100%;
                overflow-wrap: break-word;
            }
        </style>
    `;
    $('head').append(preventHorizontalScrollStyle);

    // 質問票のデータ
    const questionnaire = {
        "title": "生活のしやすさに関する質問票",
        "instructions": "これは生活の中で患者さんやご家族が感じるつらさについて情報を共有し、必要に応じて医療スタッフがサポートするための質問票です。",
        "questions": [
            {
                "id": 0,
                "question": "患者さんとご回答者のご関係を教えて下さい",
                "type": "single_choice",
                "options": ["ご本人", "ご家族", "医療者"]
            },
            {
                "id": 1.1,
                "question": "以下の項目について、あり／なしをお答え下さい",
                "type": "single_choice",
                "subItems": [
                    {
                        "item": "病状や治療について詳しく知りたいことや相談したいことはありますか？",
                        "options": ["あり", "なし"]
                    },
                    {
                        "item": "経済的な心配や制度で分からないことがありますか？",
                        "options": ["あり", "なし"]
                    },
                    {
                        "item": "日常生活で困っていることがありますか？（食事・入浴・移動・排尿・排便など）",
                        "options": ["あり", "なし"]
                    },
                    {
                        "item": "通院が大変だと感じることがありますか？",
                        "options": ["あり", "なし"]
                    }
                ]
            },
            {
                "id": 1,
                "question": "そのほか、気になっていること、心配していることがあればご記入下さい",
                "type": "open_ended"
            },
            {
                "id": 2,
                "subquestion": "からだの症状についておうかがいします",
                "question": "現在のからだの症状はどの程度ですか？",
                "type": "single_choice",
                "options": [
                    "4: 我慢できない症状がずっとつづいている",
                    "3: 我慢できないことがしばしばあり対応してほしい",
                    "2: それほどひどくないが方法があるなら考えてほしい",
                    "1: 現在の治療に満足している",
                    "0: 症状なし"
                ]
            },
            {
                "id": 2.1,
                "question": "症状は何ですか？",
                "type": "open_ended"
            },
            {
                "id": 3,
                "question": "この1週間の気持ちのつらさを平均して、最もあてはまる数字に●をつけて下さい。",
                "subquestion": "気持ちのつらさについておうかがいします",
                "type": "numeric_scale",
                "scale": {
                    "min": 0,
                    "max": 10,
                    "options": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
                    "anchors": {
                        "10": "最高につらい",
                        "5": "中くらいにつらい",
                        "0": "つらさはない"
                    }
                }
            },
            {
                "id": 4,
                "question": "以下の専門のチームへの相談を希望するかどうかについてお尋ねします",
                "type": "single_choice",
                "subItems": [
                    {
                        "item": "痛みなどからだの症状や気持ちのつらさに対応する緩和ケア医師、看護師への相談を希望しますか？",
                        "options": [
                            "希望する",
                            "必要になったら希望する",
                            "希望しない"
                        ]
                    },
                    {
                        "item": "経済的な問題や、制度の疑問に対応する医療ソーシャルワーカーへの相談を希望しますか？",
                        "options": [
                            "希望する",
                            "必要になったら希望する",
                            "希望しない"
                        ]
                    },
                    {
                        "item": "自宅での生活がしやすいように、利用できるサービスがあるかどうかについて、相談を希望しますか？",
                        "options": [
                            "希望する",
                            "必要になったら希望する",
                            "希望しない"
                        ]
                    }
                ]
            }
        ]
    };

    let currentQuestionIndex = 0;
    let currentSubQuestionIndex = 0;
    let answers = {};
    let relationshipAnswer = ""; // 関係性の回答を保存する変数

    // 開始ボタンのイベントリスナー
    $('#startButton').on('click', function() {
        // 開始画面を非表示
        $('#startScreen').hide();
        // チャットインターフェースを表示
        $('#chatInterface').show();
        
        // ページを先頭にスクロール
        window.scrollTo(0, 0);
        $('html, body').scrollTop(0);
        
        // 最初のメッセージを表示
        addBotMessages([
            'これは、生活の中で患者さんやご家族が感じるつらさを早期に把握し、必要に応じて専門スタッフがサポートするための質問票です。',
            'それでは質問に順番にお答えください。'
        ]);
        
        // 最初の質問を表示
        setTimeout(() => {
            showQuestion(0);
        }, 2000);
    });

    // ページ下部に自動スクロール
    function scrollToLatestContent() {
        const $chatMessages = $('#chatMessages');
        $chatMessages.animate({
            scrollTop: $chatMessages[0].scrollHeight
        }, 600);
        
        // 画面全体も適切な位置までスクロール
        const $lastMessage = $('.message:last-child, .options:last-child, .text-input-container:last-child, .vas-container:last-child');
        if ($lastMessage.length) {
            const bottomPosition = $lastMessage.offset().top + $lastMessage.outerHeight();
            const windowHeight = $(window).height();
            const targetScroll = bottomPosition - windowHeight + 100; // 余白を100px確保
            
            $('html, body').animate({
                scrollTop: Math.max(targetScroll, 0)
            }, 600);
        }
    }

    // ボットメッセージを追加
    function addBotMessage(text) {
        const $messageDiv = $('<div class="message bot"></div>');
        const $messageContent = $('<div class="message-content"></div>').text(text);
        $messageDiv.append($messageContent);
        $('#chatMessages').append($messageDiv);
        scrollToLatestContent();
    }

    // ユーザーメッセージを追加
    function addUserMessage(text) {
        const $messageDiv = $('<div class="message user"></div>');
        const $messageContent = $('<div class="message-content"></div>').text(text);
        $messageDiv.append($messageContent);
        $('#chatMessages').append($messageDiv);
        scrollToLatestContent();
    }

    // 複数のボットメッセージを連続して表示
    function addBotMessages(messages, currentIndex = 0, delay = 600) {
        if (currentIndex < messages.length) {
            addBotMessage(messages[currentIndex]);
            setTimeout(() => {
                addBotMessages(messages, currentIndex + 1, delay);
            }, delay);
        }
    }

    // 質問を表示する関数
    function showQuestion(index) {
        if (index >= questionnaire.questions.length) {
            // 全ての質問が終了したら結果表示ボタンを表示
            showResultButton();
            return;
        }

        const question = questionnaire.questions[index];
        
        // サブクエスチョンがあれば先に表示
        if (question.subquestion) {
            addBotMessage(question.subquestion);
            setTimeout(() => {
                // 質問を表示
                addBotMessage(question.question);
                createQuestionUI(index);
            }, 500);
        } else {
            // 質問を表示
            addBotMessage(question.question);
            createQuestionUI(index);
        }
    }
    
    // 質問タイプに応じたUI要素を作成
    function createQuestionUI(index) {
        const question = questionnaire.questions[index];
        
        setTimeout(() => {
            switch(question.type) {
                case "open_ended":
                    createOpenEndedInput(index);
                    break;
                case "single_choice":
                    // サブアイテムがある場合は、サブアイテムの処理を開始
                    if (question.subItems) {
                        setTimeout(() => {
                            // 最初のサブアイテムを表示
                            currentSubQuestionIndex = 0;
                            showSubQuestion(index, currentSubQuestionIndex);
                        }, 500);
                    } else {
                        // 通常の単一選択肢
                        createSingleChoiceOptions(index);
                    }
                    break;
                case "numeric_scale":
                    if (question.scale.anchors) {
                        // スケールの目盛りの説明を表示
                        const anchorsText = Object.entries(question.scale.anchors)
                            .map(([value, label]) => `${value}: ${label}`)
                            .join('、 ');
                        addBotMessage(anchorsText);
                    }
                    setTimeout(() => {
                        createNumericScale(index);
                    }, 500);
                    break;
            }
        }, 500);
    }
    
    // サブクエスチョンを表示
    function showSubQuestion(questionIndex, subIndex) {
        const question = questionnaire.questions[questionIndex];
        const subItems = question.subItems;
        
        if (subIndex >= subItems.length) {
            // すべてのサブアイテムが終了したら次の質問へ
            setTimeout(() => {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            }, 800);
            return;
        }
        
        // サブアイテムを表示
        addBotMessage(subItems[subIndex].item);
        
        // 選択肢を表示
        setTimeout(() => {
            createSubItemOptions(questionIndex, subIndex);
        }, 500);
    }
    
    // サブアイテムの選択肢を作成
    function createSubItemOptions(questionIndex, subIndex) {
        const question = questionnaire.questions[questionIndex];
        const subItem = question.subItems[subIndex];
        
        // 選択肢ボタンを作成
        const $optionsDiv = $('<div class="options options-container"></div>');
        
        subItem.options.forEach((option) => {
            const $button = $('<button class="option-button"></button>').text(option);
            
            // 既存の回答があれば選択状態にする
            if (answers[question.id] && answers[question.id][subItem.item] === option) {
                $button.addClass('selected');
            }
            
            $button.on('click', function() {
                // ボタンの選択状態を変更
                $optionsDiv.find('.option-button').removeClass('selected');
                $(this).addClass('selected');
                
                // 回答を保存
                if (!answers[question.id]) {
                    answers[question.id] = {};
                }
                answers[question.id][subItem.item] = option;
                
                // この質問が現在の質問で、このサブアイテムが現在のサブアイテムの場合のみ次に進む
                if (currentQuestionIndex === questionIndex && currentSubQuestionIndex === subIndex) {
                    // 次のサブアイテムに進む
                    setTimeout(() => {
                        // 次のサブアイテムを表示（選択肢は残したまま）
                        currentSubQuestionIndex++;
                        showSubQuestion(questionIndex, currentSubQuestionIndex);
                    }, 800);
                }
            });
            
            $optionsDiv.append($button);
        });
        
        // 余白を確保するための空のdivを追加
        $optionsDiv.append('<div class="options-padding"></div>');
        
        $('#chatMessages').append($optionsDiv);
        scrollToLatestContent();
    }

    // 単一選択肢を作成（関係性質問、症状レベル質問用）
    function createSingleChoiceOptions(questionIndex) {
        const question = questionnaire.questions[questionIndex];
        
        // 選択肢ボタンを作成
        const $optionsDiv = $('<div class="options options-container"></div>');
        
        question.options.forEach((option) => {
            const $button = $('<button class="option-button"></button>').text(option);
            
            // 既存の回答があれば選択状態にする
            if (answers[question.id] === option) {
                $button.addClass('selected');
            }
            
            $button.on('click', function() {
                // ボタンの選択状態を変更
                $optionsDiv.find('.option-button').removeClass('selected');
                $(this).addClass('selected');
                
                // 回答を保存
                answers[question.id] = option;
                
                // 関係性の質問であれば特別に保存
                if (question.id === 0) {
                    relationshipAnswer = option;
                }
                
                // この質問が現在の質問の場合のみ次の質問に進む
                if (currentQuestionIndex === questionIndex) {
                    // ユーザーメッセージは特定の質問（ID 0と2）以外に表示
                    if (question.id !== 0 && question.id !== 2) {
                        addUserMessage(option);
                    }
                    
                    // 質問ID 2で「0: 症状なし」が選択された場合の特別処理
                    if (question.id === 2 && option === "0: 症状なし") {
                        // 質問2.1をスキップして、「症状なし」を回答として設定
                        answers[2.1] = "症状なし";
                        
                        // 質問3に直接進む（質問2.1をスキップ）
                        setTimeout(() => {
                            // currentQuestionIndexを2つ進める（2.1をスキップ）
                            currentQuestionIndex += 2;
                            showQuestion(currentQuestionIndex);
                        }, 800);
                    } else {
                        // 通常通り次の質問へ
                        setTimeout(() => {
                            currentQuestionIndex++;
                            showQuestion(currentQuestionIndex);
                        }, 800);
                    }
                }
            });
            
            $optionsDiv.append($button);
        });
        
        // 余白を確保するための空のdivを追加
        $optionsDiv.append('<div class="options-padding"></div>');
        
        $('#chatMessages').append($optionsDiv);
        scrollToLatestContent();
    }

    // テキスト入力フォームを作成
    function createOpenEndedInput(questionIndex) {
        const $inputContainer = $('<div class="text-input-container"></div>');
        const $textInput = $('<textarea class="text-input" rows="3" placeholder="こちらに入力してください"></textarea>');
        const $submitButton = $('<button class="text-submit">確定</button>');
        
        $inputContainer.append($textInput, $submitButton);
        $('#chatMessages').append($inputContainer);
        scrollToLatestContent();
        
        $textInput.focus();
        
        $submitButton.on('click', function() {
            const answer = $textInput.val().trim();
            if (answer) {
                // 回答を保存
                answers[questionnaire.questions[questionIndex].id] = answer;
                
                // 入力フォームを非表示（削除ではなく）
                $inputContainer.hide();
                
                // この質問が現在の質問の場合のみ次の質問に進む
                if (currentQuestionIndex === questionIndex) {
                    // ユーザーメッセージとして表示
                    addUserMessage(answer);
                    
                    // 入力フォームを削除
                    $inputContainer.remove();
                    
                    // 次の質問へ進む
                    setTimeout(() => {
                        currentQuestionIndex++;
                        showQuestion(currentQuestionIndex);
                    }, 800);
                }
            } else {
                alert('回答を入力してください');
            }
        });
    }

    // 数値スケールを作成
    function createNumericScale(questionIndex) {
        const question = questionnaire.questions[questionIndex];
        const scale = question.scale;
        
        const $scaleContainer = $('<div class="vas-container"></div>');
        const $slider = $('<input type="range" class="vas-slider" min="' + scale.min + '" max="' + scale.max + '">');
        const $value = $('<div class="vas-value">選択してください</div>');
        const $confirmButton = $('<button class="vas-confirm">確定</button>');
        
        // 既存の回答があれば設定
        if (answers[question.id]) {
            $slider.val(answers[question.id]);
            updateValueDisplay(answers[question.id]);
            $confirmButton.prop('disabled', false);
        }
        
        // スライダーの値が変わるたびに表示を更新
        $slider.on('input', function() {
            const value = $(this).val();
            updateValueDisplay(value);
            $confirmButton.prop('disabled', false);
        });
        
        // 確定ボタンを初期状態では無効に（既存の回答がない場合）
        if (!answers[question.id]) {
            $confirmButton.prop('disabled', true);
        }
        
        function updateValueDisplay(value) {
            let displayText = value;
            
            // 選択肢にラベルがある場合、ラベルも表示
            if (scale.options && Array.isArray(scale.options)) {
                const option = scale.options.find(opt => {
                    return opt.value !== undefined ? opt.value == value : opt == value;
                });
                
                if (option && option.label) {
                    displayText = `${value}: ${option.label}`;
                }
            }
            
            $value.text(displayText);
        }
        
        // 確定ボタンのイベントリスナー
        $confirmButton.on('click', function() {
            if ($(this).prop('disabled')) {
                return;
            }
            
            const value = $slider.val();
            
            // 回答を保存
            answers[question.id] = value;
            
            // この質問が現在の質問の場合のみ次の質問に進む
            if (currentQuestionIndex === questionIndex) {
                // ユーザーメッセージとして表示
                let displayValue = value;
                if (scale.options) {
                    const option = scale.options.find(opt => {
                        return opt.value !== undefined ? opt.value == value : opt == value;
                    });
                    if (option && option.label) {
                        displayValue = `${value}: ${option.label}`;
                    }
                }
                addUserMessage(displayValue);
                
                // スケールコンテナを削除
                $scaleContainer.remove();
                
                // 通常通り次の質問へ
                setTimeout(() => {
                    currentQuestionIndex++;
                    showQuestion(currentQuestionIndex);
                }, 800);
            }
        });
        
        $scaleContainer.append($slider, $value, $confirmButton);
        $('#chatMessages').append($scaleContainer);
        scrollToLatestContent();
    }

    // 結果表示ボタンを表示
    function showResultButton() {
        addBotMessages([
            'すべての質問に回答いただき、ありがとうございました。',
            '回答内容を確認し、必要に応じて専門スタッフからサポートをさせていただきます。'
        ]);
        
        setTimeout(() => {
            // すでに結果ボタンがある場合は作成しない
            if ($('#showResultButton').length === 0) {
                const $resultButtonContainer = $('<div class="button-container" id="resultButtonContainer"></div>');
                const $resultButton = $('<button id="showResultButton">回答結果を表示</button>');
                
                $resultButton.on('click', function() {
                    $(this).prop('disabled', true);
                    $(this).text('表示中...');
                    
                    // 結果画面を表示
                    showResults();
                    
                    // ボタンを再度有効化し、テキストを元に戻す
                    setTimeout(() => {
                        $(this).prop('disabled', false);
                        $(this).text('回答結果を表示');
                    }, 1500);
                    
                    // ボタンコンテナを削除しない
                    // $resultButtonContainer.remove(); この行を削除
                });
                
                $resultButtonContainer.append($resultButton);
                $('#chatMessages').append($resultButtonContainer);
            } else {
                // すでにボタンが存在する場合は再度有効化
                $('#showResultButton').prop('disabled', false);
                $('#showResultButton').text('回答結果を表示');
            }
            
            scrollToLatestContent();
        }, 1500);
    }

    // 結果表示関数
    function showResults() {
        // 結果セクションがまだ表示されていない場合のみメッセージを追加
        if (!$('#resultSection').is(':visible')) {
            addBotMessage('回答結果:');
        }
        
        // 結果セクションを表示
        $('#resultSection').show();
        
        // 結果をクリアして更新
        $('#resultMessage').empty();
        $('#mailContainer').empty();
        $('#qrcode').empty();
        
        // 結果をチャット内に表示
        const formattedText = generateFormattedText(answers);
        $('#resultMessage').html(formattedText);
        
        // 人間が読める形式の回答を生成
        const readableData = generateReadableData(answers);
        
        // メール送信リンク
        const mailSubject = encodeURIComponent('生活のしやすさに関する質問票の回答');
        const mailBody = encodeURIComponent(readableData);
        const mailLink = `mailto:?subject=${mailSubject}&body=${mailBody}`;
        
        $('#mailContainer').html(`
            <a href="${mailLink}" class="mail-link">メールで送信</a>
        `);
        
        // QRコード生成
        generateQRCode(readableData);
        
        // 結果セクションまでスクロール
        $('html, body').animate({
            scrollTop: $('#resultSection').offset().top
        }, 800);
    }

    // 人間が読める形式のデータを生成する関数
    function generateReadableData(data) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        
        let text = `回答日：${dateStr}\n`;
        text += `記入者：${relationshipAnswer}\n\n`;
        
        // アラートが必要かどうかを確認
        let hasAlert = false;
        
        // 「あり/なし」の回答をまとめる
        if (data[1.1]) {
            let yesNoAnswers = [];
            let hasYes = false; // 「あり」が1つ以上あるかチェック
            
            for (const [item, value] of Object.entries(data[1.1])) {
                // 「あり」の回答があるか確認
                if (value === "あり") {
                    hasYes = true;
                    hasAlert = true;
                }
                yesNoAnswers.push(value);
            }
            
            // 「あり」が1つ以上ある場合は「●」マークを追加
            text += `設問1：${yesNoAnswers.join('-')}${hasYes ? '　●' : ''}\n`;
        }
        
        // 自由記述
        if (data[1]) {
            // 全角換算で10文字以上かチェック（簡易的な計算）
            const hasLongText = data[1].length >= 10;
            if (hasLongText) hasAlert = true;
            text += `設問1.1：${data[1]}${hasLongText ? '　●' : ''}\n`;
        }
        
        // 身体症状のレベル
        if (data[2]) {
            // 数値のみ抽出（「4: 我慢できない...」から「4」の部分を取り出す）
            const symptomLevel = data[2].split(':')[0].trim();
            // 値が2以上かチェック
            const needsAttention = parseInt(symptomLevel) >= 2;
            if (needsAttention) hasAlert = true;
            text += `設問2：${symptomLevel}${needsAttention ? '　●' : ''}\n`;
        }
        
        // 症状詳細
        if (data[2.1]) {
            text += `設問2.1：${data[2.1]}\n`;
        }
        
        // 気持ちのつらさ
        if (data[3]) {
            // 値が7以上かチェック
            const needsAttention = parseInt(data[3]) >= 7;
            if (needsAttention) hasAlert = true;
            text += `設問3：${data[3]}${needsAttention ? '　●' : ''}\n`;
        }
        
        // 専門チームへの相談希望
        if (data[4]) {
            let consultationAnswers = [];
            let hasImmediate = false; // 「すぐに希望する」が1つ以上あるかチェック
            
            for (const [item, value] of Object.entries(data[4])) {
                // 「すぐに希望する」の回答があるか確認
                if (value === "すぐに希望する") {
                    hasImmediate = true;
                    hasAlert = true;
                }
                consultationAnswers.push(value);
            }
            
            // 「すぐに希望する」が1つ以上ある場合は「●」マークを追加
            text += `設問4：${consultationAnswers.join('-')}${hasImmediate ? '　●' : ''}\n`;
        }
        
        return text;
    }
    
    // 結果のテキスト生成関数
    function generateFormattedText(data) {
        let text = '<h3>生活のしやすさに関する質問票 - 回答結果</h3>';
        
        const today = new Date();
        const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
        text += `<p>回答日：${dateStr}</p>`;
        
        if (relationshipAnswer) {
            text += `<p>記入者：${relationshipAnswer}</p>`;
        }
        
        text += '<hr>';
        
        questionnaire.questions.forEach(question => {
            const answer = data[question.id];
            if (answer !== undefined && question.id !== 0) { // 関係性の質問は上で表示済みなのでスキップ
                // 質問を表示
                text += `<strong>${question.question}</strong><br>`;
                
                if (typeof answer === 'string' || typeof answer === 'number') {
                    // 通常の回答（アラートマークを削除）
                    text += `${answer}<br><br>`;
                } else if (typeof answer === 'object') {
                    // サブアイテムを持つ質問の回答
                    for (const [item, value] of Object.entries(answer)) {
                        text += `・${item}: ${value}<br>`;
                    }
                    
                    text += '<br>';
                }
            }
        });
        
        return text;
    }

    // QRコード生成関数
    function generateQRCode(data) {
        // QRコードを生成
        $('#qrcode').empty();
        $('#qrcode').append('<h3>QRコード</h3>');
        $('#qrcode').append('<p>このQRコードをスキャンすると回答データが取得できます。</p>');
        
        // UTF-8からShift_JISに変換
        const utf8Array = Encoding.stringToCode(data);
        const sjisArray = Encoding.convert(utf8Array, {
            to: 'SJIS',
            from: 'UNICODE'
        });
        
        // バイナリ文字列に変換
        const sjisStr = Encoding.codeToString(sjisArray);
        
        const $qrDiv = $('<div></div>');
        $qrDiv.qrcode({
            text: sjisStr,
            width: 256,
            height: 256
        });
        
        $('#qrcode').append($qrDiv);
    }
});