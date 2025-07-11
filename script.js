$(document).ready(function() {
    window.scrollTo(0, 0);

    // URLパラメータから患者ID(診察券番号)を取得する
    function getPatientIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patientId');
        return patientId ? patientId.trim().replace(/\/$/, '') : '';
    }
    
    // URLパラメータからメールアドレスを取得する
    function getEmailFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        return email ? email.trim().replace(/\/$/, '') : '';
    }
    
    // 患者IDをフォームに設定
    function setPatientIdToForms() {
        const patientId = getPatientIdFromUrl();
        if (patientId) {
            console.log('URLパラメータから患者ID取得: ' + patientId);
            
            // PSAフォームの診察券番号入力
            if (document.getElementById('psaPatientId')) {
                document.getElementById('psaPatientId').value = patientId;
            }
            
            // 各種お手続きの診察券番号入力フィールド（遅延して設定）
            $(document).on('focus', '#patientIdInput', function() {
                if (!this.value && patientId) {
                    this.value = patientId;
                }
            });
        }
    }
    
    // 初期化時に患者IDを設定
    setPatientIdToForms();

    // メール送信ボタンのクリックイベントを削除

    // フォームに入力があったかどうかのフラグ
    let hasUserInput = false;
    
    // 症状の選択肢を定義
    const symptoms = [
        "排尿しづらい", "頻尿", "残尿感", "血尿", "排便時の痛み", "便に血が混ざる", "性機能の低下"
    ];
    
    // 症状アンケートの質問を定義
    const symptomQuestions = [
        {
            id: "current",
            intro: "まずは現在の症状をお聞かせください。",
            text: "以下の症状のうち、ここ1ヶ月以内に見られた症状を選択してください（複数選択可）"
        },
        {
            id: "worse",
            text: "それらの症状のうち、前回の問診時と比較して悪化している症状を選択してください（複数選択可）"
        },
        {
            id: "better",
            text: "次に、前回の問診時と比較して改善している症状を選択してください（複数選択可）"
        }
    ];
    
    // IPSSとEQ-5Dの質問と選択肢を定義
    const questions = {
        ipss: [
            {
                id: 1,
                text: "この1ヶ月間で、尿が出終わった後に尿がまだ残っている感じがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 2,
                text: "この1ヶ月間で、尿をし始めてから2時間以内にもう一度しなければならないことがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 3,
                text: "この1ヶ月間で、尿をしている途中で尿が途切れることがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 4,
                text: "この1ヶ月間で、尿を我慢するのが難しいことがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 5,
                text: "この1ヶ月間で、尿の勢いが弱いことがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 6,
                text: "この1ヶ月間で、尿をし始めるためにいきむ必要がありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 7,
                text: "この1ヶ月間で、夜寝てから朝起きるまでに何回尿をするために起きましたか？",
                options: ["0回", "1回", "2回", "3回", "4回", "5回以上"]
            },
            {
                id: 8,
                text: "現在の排尿状態が今後ずっと続くとしたら、あなたはどう感じますか？",
                options: ["とても満足", "満足", "やや満足", "どちらでもない", "やや不満", "不満", "とても不満"]
            }
        ],
        eq5d: [
            {
                id: 101,
                text: "移動の程度について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は歩き回るのに問題はない", "私は歩き回るのにいくらか問題がある", "私は歩き回るのに中程度の問題がある", "私は歩き回るのに重度の問題がある", "私は歩き回ることができない"]
            },
            {
                id: 102,
                text: "身の回りの管理について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は自分で身の回りの管理をするのに問題はない", "私は自分で身の回りの管理をするのにいくらか問題がある", "私は自分で身の回りの管理をするのに中程度の問題がある", "私は自分で身の回りの管理をするのに重度の問題がある", "私は自分で身の回りの管理をすることができない"]
            },
            {
                id: 103,
                text: "普段の活動（仕事、勉強、家事、家族、余暇活動）について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は普段の活動を行うのに問題はない", "私は普段の活動を行うのにいくらか問題がある", "私は普段の活動を行うのに中程度の問題がある", "私は普段の活動を行うのに重度の問題がある", "私は普段の活動を行うことができない"]
            },
            {
                id: 104,
                text: "痛み／不快感について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は痛みや不快感はない", "私はいくらかの痛みや不快感がある", "私は中程度の痛みや不快感がある", "私は重度の痛みや不快感がある", "私は極度の痛みや不快感がある"]
            },
            {
                id: 105,
                text: "不安／ふさぎ込みについて、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は不安でもふさぎ込んでもいない", "私はいくらか不安またはふさぎ込んでいる", "私は中程度に不安またはふさぎ込んでいる", "私は重度に不安またはふさぎ込んでいる", "私は極度に不安またはふさぎ込んでいる"]
            },
            {
                id: 106,
                text: "あなたの今日の健康状態がどのくらい良いか悪いかを0～100で教えてください。\n（100はあなたの想像できる最も良い健康状態を、0はあなたの想像できる最も悪い健康状態を表しています。）",
                type: "vas",
                min: 0,
                max: 100
            }
        ]
    };
    
    let currentFormType = "";
    let currentQuestionIndex = 0;
    
    // 症状に関する回答を保存する配列
    let symptomAnswers = {
        current: new Array(symptoms.length).fill(0),
        worse: new Array(symptoms.length).fill(0),
        better: new Array(symptoms.length).fill(0)
    };
    
    let answers = {
        ipss: new Array(questions.ipss.length).fill(null),
        eq5d: new Array(questions.eq5d.length).fill(null)
    };
    
    // 手続きのチャット用
    let procedureAnswers = {
        userType: "",
        procedureType: "",
        deathDate: "",
        reason: "",
        newEmail: "",
        patientId: "",
        currentEmail: ""
    };
    
    // 手続きのフラグ
    let isProcedureMode = false;
    
    // 症状質問のインデックス
    let currentSymptomQuestionIndex = 0;
    
    // 開始ボタンのイベントリスナー
    $('#startButton').on('click', function() {
        // 開始画面を非表示
        $('#startScreen').hide();
        // チャットインターフェースを表示
        $('#chatInterface').show();
        
        // 複数のメッセージを遅延を入れて表示
        addBotMessages([
            "それでは質問を開始します。"
        ]);
        
        // 症状に関する質問から開始
        setTimeout(() => {
            showSymptomQuestion(currentSymptomQuestionIndex);
        }, 1200);
    });
    
    // 症状に関する質問を表示する関数
    function showSymptomQuestion(index) {
        if (index >= symptomQuestions.length) {
            // 症状質問が終了したら、IPSS-QOLスコアのアンケートに進む
            setTimeout(() => {
                addBotMessages([
                    "ありがとうございました。",
                    "次に、排尿症状の詳細についてお聞きします。"
                ]);
                
                setTimeout(() => {
                    currentFormType = 'ipss';
                    currentQuestionIndex = 0;
                    showQuestion(currentQuestionIndex);
                }, 1200);
            }, 600);
            return;
        }

        const question = symptomQuestions[index];
        
        // イントロメッセージがあれば表示
        if (question.intro) {
            const introMessageDiv = addMessage(question.intro, false);
            setTimeout(() => {
                scrollToLatestContent(introMessageDiv);
            }, 100);
        }
        
        setTimeout(() => {
            const messageDiv = addMessage(question.text, false);
            
            // 質問を表示してから選択肢を表示するまでに遅延を入れる
            setTimeout(() => {
                // 複数選択のコンテナを作成
                const multiSelectContainer = document.createElement('div');
                multiSelectContainer.className = 'multi-select-container';
                
                // 症状のボタンを作成
                symptoms.forEach((symptom, symptomIndex) => {
                    const button = document.createElement('button');
                    button.className = 'symptom-button';
                    button.textContent = symptom;
                    button.setAttribute('data-symptom-index', symptomIndex);
                    button.setAttribute('data-question-id', question.id);
                    
                    // 既に選択済みの場合はselectedクラスを追加
                    if (symptomAnswers[question.id][symptomIndex] === 1) {
                        button.classList.add('selected');
                    }
                    
                    button.onclick = function() {
                        // 選択状態を切り替え
                        if (this.classList.contains('selected')) {
                            this.classList.remove('selected');
                            symptomAnswers[question.id][symptomIndex] = 0;
                        } else {
                            this.classList.add('selected');
                            symptomAnswers[question.id][symptomIndex] = 1;
                        }
                    };
                    
                    multiSelectContainer.appendChild(button);
                });
                
                // 確定ボタンを作成
                const confirmButton = document.createElement('button');
                confirmButton.className = 'symptom-confirm-button';
                confirmButton.textContent = '確定';
                confirmButton.onclick = function() {
                    // 確定ボタンを非表示にする
                    this.style.display = 'none';
                    
                    // 少し遅延させてから次の質問に進む
                    setTimeout(() => {
                        // 次の質問に進む
                        currentSymptomQuestionIndex++;
                        showSymptomQuestion(currentSymptomQuestionIndex);
                    }, 300);
                };
                
                const confirmContainer = document.createElement('div');
                confirmContainer.className = 'symptom-confirm-container';
                confirmContainer.appendChild(confirmButton);
                
                messageDiv.appendChild(multiSelectContainer);
                messageDiv.appendChild(confirmContainer);
                
                // 質問と選択肢が表示された後にスクロール
                setTimeout(() => {
                    scrollToLatestContent(confirmButton);
                }, 200);
            }, 600);
        }, question.intro ? 800 : 0);
    }
    
    // 各種お手続きボタンのイベントリスナー
    $('#procedureButton').on('click', function() {
        isProcedureMode = true;
        
        // 開始画面を非表示
        $('#startScreen').hide();
        // チャットインターフェースを表示
        $('#chatInterface').show();
        
        // 最初の質問を表示
        setTimeout(() => {
            showProcedureQuestion('userType');
        }, 600);
    });
    
    // 手続き用の質問を表示する関数
    function showProcedureQuestion(questionType) {
        let question = "";
        let options = [];
        
        switch(questionType) {
            case 'userType':
                question = "患者さんと、ご回答者のご関係を教えて下さい";
                options = ["ご本人", "ご家族", "医療関係者"];
                break;
            case 'procedureType':
                question = "どのようなことでお困りですか？";
                options = ["登録メールアドレスを変更したい", "アンケートへの参加をやめたい"];
                break;
            case 'stopReason':
                question = "差し支えなければ理由をご回答いただけますか？";
                const reasonOptions = ["メール配信が煩わしい", "操作が難しすぎる", "個人情報保護に関する懸念"];
                
                // ご本人以外の場合のみ「患者さんがお亡くなりになった」を追加
                if (procedureAnswers.userType !== "ご本人") {
                    reasonOptions.push("患者さんがお亡くなりになった");
                }
                
                reasonOptions.push("答えたくない");
                options = reasonOptions;
                break;
        }
        
        const messageDiv = addMessage(question, false);
        
        // 質問を表示してから選択肢を表示するまでに遅延を入れる
        setTimeout(() => {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            optionsDiv.setAttribute('data-question-type', questionType);
            
            options.forEach((option) => {
                const button = document.createElement('button');
                button.className = 'option-button';
                button.textContent = option;
                button.setAttribute('data-question-type', questionType);
                button.setAttribute('data-option', option);
                button.onclick = function() {
                    handleProcedureOptionClick(this, questionType, option);
                };
                
                optionsDiv.appendChild(button);
            });
            
            messageDiv.appendChild(optionsDiv);
            
            // 質問と選択肢が表示された後にスクロール
            setTimeout(() => {
                scrollToLatestContent(messageDiv.lastChild);
            }, 200);
        }, 600);
    }
    
    // 手続き用の選択肢クリック処理
    function handleProcedureOptionClick(buttonElement, questionType, selectedOption) {
        const currentOptions = document.querySelectorAll(`.options[data-question-type="${questionType}"] .option-button`);
        
        // 同じ質問の全ての選択肢からselectedクラスを削除
        currentOptions.forEach(button => {
            button.classList.remove('selected');
            button.classList.remove('animated-select');
        });
        
        // クリックされた選択肢にselectedクラスを追加
        buttonElement.classList.add('selected');
        buttonElement.classList.add('animated-select');
        
        // 回答を保存
        procedureAnswers[questionType] = selectedOption;
        
        // 次の質問または処理へ進む
        setTimeout(() => {
            handleProcedureFlow(questionType, selectedOption);
        }, 600);
    }
    
    // 手続きフローの制御
    function handleProcedureFlow(questionType, selectedOption) {
        switch(questionType) {
            case 'userType':
                // ユーザータイプを保存して診察券番号入力へ進む
                showPatientIdForm();
                break;
                
            case 'procedureType':
                if (selectedOption === "登録メールアドレスを変更したい") {
                    // メールアドレス変更フロー
                    showEmailChangeForm();
                } else {
                    // アンケート参加終了フロー
                    showProcedureQuestion('stopReason');
                }
                break;
                
            case 'stopReason':
                procedureAnswers.reason = selectedOption;
                
                if (selectedOption === "患者さんがお亡くなりになった") {
                    // 死亡日入力フォームを表示
                    showDeathDateForm();
                } else {
                    // その他の理由の場合は参加終了処理へ
                    showStopParticipationConfirmation();
                }
                break;
        }
    }
    
    // メールアドレス変更フォームを表示
    function showEmailChangeForm() {
        const messageDiv = addMessage("承知いたしました。それでは新しいメールアドレスをご入力ください", false);
        
        setTimeout(() => {
            // メールアドレス入力フォーム
            const formDiv = document.createElement('div');
            formDiv.className = 'email-input-form';
            
            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.placeholder = 'メールアドレス';
            emailInput.id = 'newEmailInput';
            emailInput.className = 'procedure-input';
            emailInput.pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
            emailInput.title = '正しいメールアドレスの形式で入力してください';
            
            const submitButton = document.createElement('button');
            submitButton.textContent = '確定';
            submitButton.className = 'procedure-submit';
            submitButton.onclick = function() {
                const emailValue = emailInput.value.trim();
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                
                if (emailRegex.test(emailValue)) {
                    procedureAnswers.newEmail = emailValue;
                    addMessage(emailValue, true);
                    showEmailChangeConfirmation();
                } else {
                    alert('正しいメールアドレスの形式で入力してください');
                }
            };
            
            formDiv.appendChild(emailInput);
            formDiv.appendChild(submitButton);
            messageDiv.appendChild(formDiv);
            
            setTimeout(() => {
                scrollToLatestContent(formDiv);
                emailInput.focus();
            }, 200);
        }, 600);
    }
    
    // 診察券番号入力フォームを表示
    function showPatientIdForm() {
        const messageDiv = addMessage("情報の確認のため、診察券番号および現在ご登録のメールアドレスをご入力ください", false);
        
        // URLパラメータから患者IDとメールアドレスを取得
        const patientIdFromUrl = getPatientIdFromUrl();
        const emailFromUrl = getEmailFromUrl();
        
        setTimeout(() => {
            // 診察券番号入力フォーム
            const formDiv = document.createElement('div');
            formDiv.className = 'patientid-input-form';
            
            const patientIdInput = document.createElement('input');
            patientIdInput.type = 'text';
            patientIdInput.inputMode = 'numeric';
            patientIdInput.placeholder = '診察券番号（半角数字）';
            patientIdInput.id = 'patientIdInput';
            patientIdInput.className = 'procedure-input';
            patientIdInput.pattern = '[0-9-]+';
            patientIdInput.title = '半角数字で入力してください';
            
            // URLパラメータからの患者IDがあれば設定
            if (patientIdFromUrl) {
                patientIdInput.value = patientIdFromUrl;
            }
            
            // メールアドレス入力フォーム
            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.placeholder = '現在ご登録のメールアドレス';
            emailInput.id = 'currentEmailInput';
            emailInput.className = 'procedure-input';
            emailInput.pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
            emailInput.title = '正しいメールアドレスの形式で入力してください';
            
            // URLパラメータからのメールアドレスがあれば設定
            if (emailFromUrl) {
                emailInput.value = emailFromUrl;
            }
            
            // 初期値がある場合の案内メッセージ
            if (patientIdFromUrl || emailFromUrl) {
                const helpText = document.createElement('p');
                helpText.className = 'pre-filled-help-text';
                helpText.textContent = '現在ご登録の値を表示しておりますので、お間違いがなければそのまま確定ボタンを押してください';
                formDiv.appendChild(helpText);
            }
            
            const submitButton = document.createElement('button');
            submitButton.textContent = '確定';
            submitButton.className = 'procedure-submit';
            submitButton.onclick = function() {
                const patientIdValue = patientIdInput.value.trim();
                const emailValue = emailInput.value.trim();
                
                if (patientIdValue && emailValue) {
                    // 冒頭の0や途中のハイフンを削除
                    const cleanedPatientId = patientIdValue.replace(/^0+|[-]/g, '');
                    procedureAnswers.patientId = cleanedPatientId;
                    procedureAnswers.currentEmail = emailValue;
                    addMessage(`診察券番号: ${patientIdValue}`, true);
                    addMessage(`メールアドレス: ${emailValue}`, true);
                    
                    // 次の質問へ進む（お手続きの種類を選択）
                    showProcedureQuestion('procedureType');
                } else {
                    if (!patientIdValue) {
                        alert('診察券番号を入力してください');
                    } else {
                        alert('メールアドレスを入力してください');
                    }
                }
            };
            
            formDiv.appendChild(patientIdInput);
            formDiv.appendChild(emailInput);
            formDiv.appendChild(submitButton);
            messageDiv.appendChild(formDiv);
            
            setTimeout(() => {
                scrollToLatestContent(formDiv);
                if (!patientIdFromUrl) {
                    patientIdInput.focus();
                } else if (!emailFromUrl) {
                    emailInput.focus();
                }
            }, 200);
        }, 600);
    }
    
    // メールアドレス変更確認メッセージとボタンを表示
    function showEmailChangeConfirmation() {
        const messageDiv = addMessage("ご入力ありがとうございました。以下のボタンからメールを送信いただくとお手続きが完了します。", false);
        
        setTimeout(() => {
            // メール送信ボタンと最初に戻るボタン
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'procedure-buttons';
            
            // メール送信ボタン
            const mailButton = document.createElement('a');
            mailButton.href = generateEmailLink('emailChange');
            mailButton.className = 'mail-link';
            mailButton.textContent = 'メール送信';
            mailButton.onclick = function() {
                const returnButton = document.getElementById('returnButton');
                returnButton.disabled = false;
                returnButton.classList.add('enabled');
            };
            
            // 最初に戻るボタン（最初は無効）
            const returnButton = document.createElement('button');
            returnButton.id = 'returnButton';
            returnButton.className = 'return-button';
            returnButton.textContent = '最初に戻る';
            returnButton.disabled = true;
            returnButton.onclick = function() {
                resetAndReturnToStart();
            };
            
            buttonContainer.appendChild(mailButton);
            buttonContainer.appendChild(returnButton);
            messageDiv.appendChild(buttonContainer);
            
            setTimeout(() => {
                scrollToLatestContent(buttonContainer);
            }, 200);
        }, 600);
    }
    
    // 死亡日入力フォームを表示
    function showDeathDateForm() {
        const messageDiv = addMessage("それは御愁傷様です。もし差し支えなければ、お亡くなりになった日付をご回答いただければ幸いです。", false);
        
        setTimeout(() => {
            // 日付入力フォーム
            const formDiv = document.createElement('div');
            formDiv.className = 'death-date-form';
            
            // 日付入力
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.id = 'deathDateInput';
            dateInput.className = 'procedure-input';
            
            // コメント
            const commentP = document.createElement('p');
            commentP.className = 'death-date-comment';
            commentP.textContent = 'ご入力頂いた情報は病院のカルテ情報に反映させていただきます。';
            
            // ボタンコンテナ
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'death-date-buttons';
            
            // 確定ボタン
            const confirmButton = document.createElement('button');
            confirmButton.textContent = '確定';
            confirmButton.className = 'procedure-submit';
            confirmButton.onclick = function() {
                const dateValue = dateInput.value;
                if (dateValue) {
                    procedureAnswers.deathDate = dateValue;
                    addMessage(dateValue, true);
                    showDeathConfirmation();
                } else {
                    alert('日付を入力してください');
                }
            };
            
            // 入力しないボタン
            const skipButton = document.createElement('button');
            skipButton.textContent = '入力しない';
            skipButton.className = 'procedure-skip';
            skipButton.onclick = function() {
                showDeathConfirmation();
            };
            
            buttonContainer.appendChild(confirmButton);
            buttonContainer.appendChild(skipButton);
            
            formDiv.appendChild(dateInput);
            formDiv.appendChild(commentP);
            formDiv.appendChild(buttonContainer);
            messageDiv.appendChild(formDiv);
            
            setTimeout(() => {
                scrollToLatestContent(formDiv);
            }, 200);
        }, 600);
    }
    
    // 死亡確認メッセージとメール送信ボタンを表示
    function showDeathConfirmation() {
        const messageDiv = addMessage("以下のボタンからメールを送信いただくとお手続きが完了します。ご回答くださいましてありがとうございました。", false);
        
        setTimeout(() => {
            // メール送信ボタン
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'procedure-buttons';
            
            const mailButton = document.createElement('a');
            mailButton.href = generateEmailLink('death');
            mailButton.className = 'mail-link';
            mailButton.textContent = 'メール送信';
            mailButton.onclick = function() {
                // メール送信後のメッセージ
                setTimeout(() => {
                    const thankMessageDiv = addMessage("ご回答くださいましてありがとうございました。ご入力頂いた情報は病院のカルテ情報に反映させていただきます。入力手続きには1週間程度を要しますので、重複のご連絡など失礼がございました際にはご容赦いただければ幸いです。", false);
                    
                    setTimeout(() => {
                        scrollToLatestContent(thankMessageDiv);
                    }, 200);
                }, 1000);
            };
            
            buttonContainer.appendChild(mailButton);
            messageDiv.appendChild(buttonContainer);
            
            setTimeout(() => {
                scrollToLatestContent(buttonContainer);
            }, 200);
        }, 600);
    }
    
    // 参加終了確認メッセージとメール送信ボタンを表示
    function showStopParticipationConfirmation() {
        const messageDiv = addMessage("承知いたしました。それでは以下のボタンからメールを送信いただきますと、配信停止のお手続きを取らせていただきます。<br>これまでご協力くださいましてありがとうございました。", false);
        
        setTimeout(() => {
            // メール送信ボタン
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'procedure-buttons';
            
            const mailButton = document.createElement('a');
            mailButton.href = generateEmailLink('stop');
            mailButton.className = 'mail-link';
            mailButton.textContent = 'メール送信';
            
            buttonContainer.appendChild(mailButton);
            messageDiv.appendChild(buttonContainer);
            
            setTimeout(() => {
                scrollToLatestContent(buttonContainer);
            }, 200);
        }, 600);
    }
    
    // 手続き用のメールリンク生成
    function generateEmailLink(type) {
        // 現在の日付を取得
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        let subject = "";
        let body = "このまま件名・内容を変更せずご送信ください\n\n";
        
        body += `入力日：${dateString}\n`;
        body += `ご回答者：${procedureAnswers.userType}\n`;
        body += `診察券番号：${procedureAnswers.patientId}\n`;
        body += `現在ご登録のメールアドレス：${procedureAnswers.currentEmail}\n`;
        
        switch (type) {
            case 'emailChange':
                subject = "【各種お手続き】登録メールアドレス変更";
                body += `新しいメールアドレス：${procedureAnswers.newEmail}\n`;
                break;
                
            case 'death':
                subject = "【各種お手続き】配信停止";
                body += `配信停止の理由：患者さんがお亡くなりになった\n`;
                if (procedureAnswers.deathDate) {
                    body += `お亡くなりになった日付：${procedureAnswers.deathDate}\n`;
                }
                break;
                
            case 'stop':
                subject = "【各種お手続き】配信停止";
                body += `配信停止の理由：${procedureAnswers.reason}\n`;
                break;
        }
        
        return `mailto:rt.questionnaire@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    // 最初の画面に戻る
    function resetAndReturnToStart() {
        // チャットインターフェースを非表示
        $('#chatInterface').hide();
        // 開始画面を表示
        $('#startScreen').show();
        
        // チャットメッセージをクリア
        $('#chatMessages').empty();
        
        // 状態をリセット
        isProcedureMode = false;
        procedureAnswers = {
            userType: "",
            procedureType: "",
            deathDate: "",
            reason: "",
            newEmail: "",
            patientId: "",
            currentEmail: ""
        };
        
        // ウィンドウを先頭にスクロール
        window.scrollTo(0, 0);
    }
    
    // スクロール処理を行う関数
    function scrollToLatestContent(target = null, offset = 100) {
        const messagesDiv = document.getElementById('chatMessages');
        
        // チャットエリア内のスクロール
        const scrollHeight = messagesDiv.scrollHeight;
        $(messagesDiv).animate({ scrollTop: scrollHeight }, 400);
        
        // ターゲット要素が指定されている場合はその要素までスクロール
        if (target) {
            const targetPosition = $(target).offset().top;
            const viewportHeight = window.innerHeight;
            const currentScroll = window.pageYOffset;
            
            // ターゲットが表示領域外にある場合のみスクロール
            if (targetPosition > currentScroll + viewportHeight - offset || 
                targetPosition < currentScroll + offset) {
                $('html, body').animate({
                    scrollTop: targetPosition - (viewportHeight / 3)
                }, 400);
            }
        }
    }
    
    // メッセージを追加する関数
    function addMessage(text, isUser = false) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = text;
        
        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);
        
        // スムーズなスクロール（メッセージの追加後）
        setTimeout(() => {
            scrollToLatestContent(messageDiv);
        }, 100);
        
        return messageDiv; // 追加したメッセージ要素を返す
    }
    
    // 複数のBOTメッセージを遅延を入れて順番に表示する関数
    function addBotMessages(messages, currentIndex = 0, delay = 600) {
        if (currentIndex >= messages.length) return;
        
        // 現在のメッセージを表示
        addMessage(messages[currentIndex], false);
        
        // 次のメッセージを遅延を入れて表示
        if (currentIndex < messages.length - 1) {
            setTimeout(() => {
                addBotMessages(messages, currentIndex + 1, delay);
            }, delay);
        }
    }
    
    // 質問を表示する関数
    function showQuestion(index) {
        if (index >= questions[currentFormType].length) {
            handleFormCompletion();
            return;
        }

        const question = questions[currentFormType][index];
        const messageDiv = addMessage(question.text, false);
        messageDiv.setAttribute('data-question-index', index);
        messageDiv.setAttribute('data-form-type', currentFormType);
        
        // 質問を表示してから選択肢を表示するまでに遅延を入れる
        setTimeout(() => {
            // 質問タイプに応じて表示を変更
            if (question.type === 'vas') {
                // VASスライダーを表示
                const vasContainer = document.createElement('div');
                vasContainer.className = 'vas-container';
                
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = question.min;
                slider.max = question.max;
                slider.value = answers[currentFormType][index] || '';
                slider.className = 'vas-slider';
                
                // VAS値入力用のテキストボックス
                const valueInputContainer = document.createElement('div');
                valueInputContainer.className = 'vas-value-container';
                
                const valueInput = document.createElement('input');
                valueInput.type = 'number';
                valueInput.min = question.min;
                valueInput.max = question.max;
                valueInput.value = answers[currentFormType][index] || '';
                valueInput.className = 'vas-value-input';
                valueInput.placeholder = '0-100';
                
                const valueLabel = document.createElement('span');
                valueLabel.className = 'vas-value-label';
                valueLabel.textContent = `/100`;
                
                valueInputContainer.appendChild(valueInput);
                valueInputContainer.appendChild(valueLabel);
                
                // スライダーの値が変更されたときの処理
                slider.oninput = function() {
                    valueInput.value = this.value;
                    answers[currentFormType][index] = this.value;
                };
                
                // テキスト入力の値が変更されたときの処理
                valueInput.oninput = function() {
                    // 入力が空の場合
                    if (this.value === '') {
                        // スライダーの値をクリア（最小値に設定）
                        slider.value = question.min;
                        // 回答データをクリア
                        answers[currentFormType][index] = '';
                        return;
                    }
                    
                    let inputValue = parseInt(this.value, 10);
                    
                    // 数値の範囲を制限
                    if (!isNaN(inputValue)) {
                        if (inputValue < question.min) inputValue = question.min;
                        if (inputValue > question.max) inputValue = question.max;
                        
                        slider.value = inputValue;
                        answers[currentFormType][index] = inputValue;
                        this.value = inputValue;
                    }
                };
                
                // 確定ボタン
                const confirmButton = document.createElement('button');
                confirmButton.className = 'option-button vas-confirm';
                confirmButton.textContent = '確定';
                confirmButton.onclick = function() {
                    if (answers[currentFormType][index]) {
                        // ボタンにconfirmedクラスを追加してブルーのままにする
                        confirmButton.classList.add('confirmed');
                        
                        // 次の質問へ進む
                        currentQuestionIndex++;
                        
                        setTimeout(() => {
                            if (currentQuestionIndex < questions[currentFormType].length) {
                                showQuestion(currentQuestionIndex);
                            } else {
                                handleFormCompletion();
                            }
                        }, 600);
                    } else {
                        // 値が選択されていない場合は警告
                        alert('値を選択してください');
                    }
                };
                
                vasContainer.appendChild(slider);
                vasContainer.appendChild(valueInputContainer);
                vasContainer.appendChild(confirmButton);
                messageDiv.appendChild(vasContainer);
            } else {
                // 通常の選択肢を表示
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                optionsDiv.setAttribute('data-question-id', question.id);
                
                question.options.forEach((option, optionIndex) => {
                    const button = document.createElement('button');
                    button.className = 'option-button';
                    
                    // もし既に回答済みならselectedクラスを追加
                    if (answers[currentFormType][index] === option) {
                        button.classList.add('selected');
                    }
                    
                    button.textContent = option;
                    button.setAttribute('data-question-index', index);
                    button.setAttribute('data-option-index', optionIndex);
                    button.setAttribute('data-form-type', currentFormType);
                    button.onclick = function() {
                        handleOptionClick(this, index, option);
                    };
                    
                    optionsDiv.appendChild(button);
                });
                
                messageDiv.appendChild(optionsDiv);
            }
            
            // 質問と選択肢が表示された後にスクロール
            setTimeout(() => {
                scrollToLatestContent(messageDiv.lastChild);
            }, 200);
        }, 600); // 質問を表示してから選択肢を表示するまでの遅延
    }
    
    // 選択肢クリック時の処理
    function handleOptionClick(buttonElement, questionIndex, selectedOption) {
        const formType = buttonElement.getAttribute('data-form-type');
        const currentOptions = document.querySelectorAll(`.options[data-question-id="${questions[formType][questionIndex].id}"] .option-button`);
        
        // 同じ質問の全ての選択肢からselectedクラスを削除
        currentOptions.forEach(button => {
            button.classList.remove('selected');
            button.classList.remove('animated-select');
        });
        
        // クリックされた選択肢にselectedクラスを追加
        buttonElement.classList.add('selected');
        
        // 回答を保存
        answers[formType][questionIndex] = selectedOption;
        
        // 色の変化だけで選択を示す
        $(buttonElement).addClass('animated-select');
        
        // 選択肢が画面の下部にある場合は選択した選択肢が見えるようにスクロール
        scrollToLatestContent(buttonElement, 150);
        
        // 過去の質問の回答を変更した場合
        if (formType === currentFormType && questionIndex !== currentQuestionIndex) {
            handlePastAnswerChange(formType, questionIndex);
            return;
        }
        
        // 現在の質問の場合、次の質問へ進む
        if (formType === currentFormType && questionIndex === currentQuestionIndex) {
            // 次の質問のインデックスを設定
            currentQuestionIndex++;
            
            // 少し遅延させて次の質問を表示
            setTimeout(() => {
                if (currentQuestionIndex < questions[currentFormType].length) {
                    showQuestion(currentQuestionIndex);
                } else {
                    handleFormCompletion();
                }
            }, 600); // 遅延を少し長くして選択のアニメーションを見せる
        }
    }
    
    // 過去の回答変更時の処理
    function handlePastAnswerChange(formType, questionIndex) {
        // 回答内容の更新のみを行う
        const selectedOption = answers[formType][questionIndex];
        
        // 選択された回答を視覚的に反映
        const currentOptions = document.querySelectorAll(`.options[data-question-id="${questions[formType][questionIndex].id}"] .option-button`);
        currentOptions.forEach(button => {
            if (button.textContent === selectedOption) {
                button.classList.add('selected', 'animated-select');
            } else {
                button.classList.remove('selected');
                button.classList.remove('animated-select');
            }
        });
        
        // 選択肢が画面の下部にある場合は選択した選択肢が見えるようにスクロール
        const selectedButton = Array.from(currentOptions).find(button => button.textContent === selectedOption);
        if (selectedButton) {
            scrollToLatestContent(selectedButton, 150);
        }
    }
    
    // フォーム完了時の処理
    function handleFormCompletion() {
        if (currentFormType === 'ipss') {
            // IPSSが終了したら、EQ-5Dに進む
            setTimeout(() => {
                // 複数のメッセージを遅延を入れて表示
                addBotMessages([
                    "続いて、生活のしやすさに関する質問に移ります。",
                    "あと6問ほどですので、ご協力よろしくお願いいたします。"
                ]);
                
                // 次のフォームの最初の質問を表示（最後のメッセージから十分な時間をあけて）
                setTimeout(() => {
                    currentFormType = 'eq5d';
                    currentQuestionIndex = 0;
                    showQuestion(currentQuestionIndex);
                }, 1200);
            }, 600);
        } else if (currentFormType === 'eq5d') {
            // EQ-5Dが終了したら、結果を表示
            setTimeout(() => {
                showResults();
            }, 600);
        }
    }
    
    // 結果を表示する関数
    function showResults() {
        const messageDiv = addMessage("全ての質問が終了しました。ご協力ありがとうございました。", false);
        
        // 結果セクションを表示
        setTimeout(() => {
            // 結果メッセージを設定
            const resultMessage = "院内でご回答の方は、端末をスタッフにご提示ください。<br>オンラインでご回答の方は、以下のボタンからPSA値の入力画面に進んでください。";
            $('#resultMessage').html(resultMessage);
            
            // 結果セクションを表示
            $('#resultSection').show();
            
            // 結果の要約を表示
            let summaryText = '<h3>ご回答内容</h3>';
            
            // 症状アンケートの結果
            summaryText += '<h4>症状アンケート</h4>';
            summaryText += '<p>現在の症状: ' + symptomAnswers.current.join('-') + '</p>';
            summaryText += '<p>悪化している症状: ' + symptomAnswers.worse.join('-') + '</p>';
            summaryText += '<p>改善している症状: ' + symptomAnswers.better.join('-') + '</p>';
            
            // IPSS-QOLスコアの結果
            summaryText += '<h4>IPSS-QOLスコア</h4>';
            const ipssScores = answers.ipss.slice(0, 7).map((answer, index) => {
                const options = questions.ipss[index].options;
                return options.indexOf(answer);
            });
            const qolScore = answers.ipss[7] ? questions.ipss[7].options.indexOf(answers.ipss[7]) : '-';
            const ipssTotal = ipssScores.reduce((sum, score) => sum + (score >= 0 ? score : 0), 0);
            summaryText += '<p>スコア: ' + ipssScores.join('-') + '-' + qolScore + '</p>';
            summaryText += '<p>合計点: ' + ipssTotal + '点</p>';
            
            // EQ-5Dの結果
            summaryText += '<h4>EQ-5D</h4>';
            const eq5dScores = answers.eq5d.slice(0, 5).map((answer, index) => {
                const options = questions.eq5d[index].options;
                return options.indexOf(answer);
            });
            summaryText += '<p>スコア: ' + eq5dScores.join('-') + '</p>';
            
            if (answers.eq5d[5]) {
                summaryText += '<p>健康状態(VAS): ' + answers.eq5d[5] + '/100</p>';
            }
            
            $('#resultSummary').html(summaryText);
            $('#resultSummary').show();
            
            // オンライン回答ボタンの生成（mail-linkクラスをonline-buttonクラスに変更）
            const onlineButton = '<a href="#psaSection" class="online-button" id="onlineButton">オンラインで回答の方はこちら</a>';
            $('#mailContainer').html(onlineButton);
            
            // オンライン回答ボタンのクリックイベント
            $('#onlineButton').on('click', function(e) {
                e.preventDefault();
                
                // PSA入力フォームを表示
                $('#psaSection').show();
                
                // フォームまでスクロール
                $('html, body').animate({
                    scrollTop: $('#psaSection').offset().top - 50
                }, 600);
            });
            
            // QRコードの生成
            generateQRCode(answers);
            
            // 結果セクションまでスクロール
            setTimeout(() => {
                $('html, body').animate({
                    scrollTop: $('#resultSection').offset().top - 50
                }, 600);
            }, 200);
        }, 1000);
    }
    
    // フォーマットされたテキストを生成する関数
    function generateFormattedText(data) {
        // フォーマットされたテキストを生成
        let formattedText = `【症状アンケート】\r\n`;
        
        // 症状の回答を追加
        formattedText += `症状: ${symptomAnswers.current.join('-')}\r\n`;
        formattedText += `悪化: ${symptomAnswers.worse.join('-')}\r\n`;
        formattedText += `改善: ${symptomAnswers.better.join('-')}\r\n`;
        
        // IPSSの結果を追加
        if (data.ipss && data.ipss.length > 0) {
            formattedText += `\r\n【IPSS-QOLスコア】\r\n`;
            
            // IPSSスコアを取得（0点始まり）
            const ipssScores = data.ipss.slice(0, 7).map(answer => {
                const index = questions.ipss.findIndex((q, i) => i < 7 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.ipss[index].options.indexOf(answer) : 0;
            });
            
            // QOLスコアを取得（0点始まり）
            const qolScore = data.ipss[7] ? questions.ipss[7].options.indexOf(data.ipss[7]) : 0;
            
            // 合計点を計算
            const ipssTotal = ipssScores.reduce((sum, score) => sum + score, 0);
            
            // スコアを追加
            formattedText += `IPSS-QOL：${ipssScores.join('-')}-${qolScore}\r\n`;
            formattedText += `IPSS-QOL合計点：${ipssTotal}点\r\n`;
        }
        
        // EQ-5Dの結果を追加
        if (data.eq5d && data.eq5d.length > 0) {
            formattedText += `\r\n【EQ-5D】\r\n`;
            
            // EQ-5Dスコアを取得（最初の5問、0点始まり）
            const eq5dScores = data.eq5d.slice(0, 5).map(answer => {
                const index = questions.eq5d.findIndex((q, i) => i < 5 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.eq5d[index].options.indexOf(answer) : 0;
            });
            
            // スコアを追加
            formattedText += `EQ-5D：${eq5dScores.join('-')}\r\n`;
            
            // VASの値を追加（6問目）
            if (data.eq5d[5]) {
                formattedText += `健康状態(VAS)：${data.eq5d[5]}/100\r\n`;
            }
        }
        
        return formattedText;
    }
    
    // Excel用のCSV形式テキストを生成する関数
    function generateCsvText(data) {
        // 現在の日付を取得
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        // ヘッダー行を作成
        let headers = ["Date"];
        let values = [dateString];
        
        // 症状の回答を追加
        for (let i = 0; i < symptoms.length; i++) {
            headers.push(`Current_${i+1}`);
            values.push(symptomAnswers.current[i]);
        }
        for (let i = 0; i < symptoms.length; i++) {
            headers.push(`Worse_${i+1}`);
            values.push(symptomAnswers.worse[i]);
        }
        for (let i = 0; i < symptoms.length; i++) {
            headers.push(`Better_${i+1}`);
            values.push(symptomAnswers.better[i]);
        }
        
        // IPSSの結果を追加
        if (data.ipss && data.ipss.length > 0) {
            // IPSSスコアを取得（0点始まり）
            const ipssScores = data.ipss.slice(0, 7).map(answer => {
                const index = questions.ipss.findIndex((q, i) => i < 7 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.ipss[index].options.indexOf(answer) : 0;
            });
            
            // QOLスコアを取得（0点始まり）
            const qolScore = data.ipss[7] ? questions.ipss[7].options.indexOf(data.ipss[7]) : 0;
            
            // ヘッダーとスコアを追加
            for (let i = 0; i < ipssScores.length; i++) {
                headers.push(`IPSS-QOL-Q${i+1}`);
                values.push(ipssScores[i]);
            }
            
            headers.push("IPSS-QOL-QOL");
            values.push(qolScore);
        }
        
        // EQ-5Dの結果を追加
        if (data.eq5d && data.eq5d.length > 0) {
            // EQ-5Dスコアを取得（最初の5問、0点始まり）
            const eq5dScores = data.eq5d.slice(0, 5).map(answer => {
                const index = questions.eq5d.findIndex((q, i) => i < 5 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.eq5d[index].options.indexOf(answer) : 0;
            });
            
            // ヘッダーとスコアを追加
            for (let i = 0; i < eq5dScores.length; i++) {
                headers.push(`EQ-5D-Q${i+1}`);
                values.push(eq5dScores[i]);
            }
            
            // VASの値を追加（6問目）
            if (data.eq5d[5]) {
                headers.push("EQ-5D-VAS");
                values.push(data.eq5d[5]);
            }
        }
        
        // タブ区切りのCSV形式で出力（改行コードを\rに変更）
        return headers.join('\t') + '\r' + values.join('\t');
    }
    
    // QRコード生成関数
    function generateQRCode(data) {
        // 現在のQRコード表示エリアをクリア
        $('#qrcode').empty();
        
        // QRコード表示エリアを作成
        const qrContainer = $('<div class="qr-container"></div>');
        const qrDisplay = $('<div id="qrDisplay"></div>');
        const qrSwitchButtons = $('<div class="qr-switch-buttons"></div>');
        
        // 通常形式ボタン
        const normalButton = $('<button class="qr-switch-btn active">通常形式</button>');
        normalButton.on('click', function() {
            $(this).addClass('active').siblings().removeClass('active');
            generateNormalQR(data);
        });
        
        // Excel形式ボタン
        const excelButton = $('<button class="qr-switch-btn">Excel形式</button>');
        excelButton.on('click', function() {
            $(this).addClass('active').siblings().removeClass('active');
            generateExcelQR(data);
        });
        
        // ボタンを追加
        qrSwitchButtons.append(normalButton).append(excelButton);
        
        // コンテナに要素を追加
        qrContainer.append(qrDisplay).append(qrSwitchButtons);
        $('#qrcode').append(qrContainer);
        
        // デフォルトで通常形式のQRコードを表示
        generateNormalQR(data);
    }
    
    // 通常形式のQRコードを生成
    function generateNormalQR(data) {
        const formattedText = generateFormattedText(data);
        
        // UTF-8からShift_JISに変換
        const utf8Array = Encoding.stringToCode(formattedText);
        const sjisArray = Encoding.convert(utf8Array, {
            to: 'SJIS',
            from: 'UNICODE'
        });
        
        // バイナリ文字列に変換
        const sjisStr = Encoding.codeToString(sjisArray);
        
        // QRコード生成
        $('#qrDisplay').empty().qrcode({
            width: 256,
            height: 256,
            text: sjisStr
        });
        
        // QRコードの下に説明を追加
        $('#qrDisplay').append('<p class="qr-description">通常形式：問診結果の詳細</p>');
    }
    
    // Excel形式のQRコードを生成
    function generateExcelQR(data) {
        const csvText = generateCsvText(data);
        
        // UTF-8からShift_JISに変換
        const utf8Array = Encoding.stringToCode(csvText);
        const sjisArray = Encoding.convert(utf8Array, {
            to: 'SJIS',
            from: 'UNICODE'
        });
        
        // バイナリ文字列に変換
        const sjisStr = Encoding.codeToString(sjisArray);
        
        // QRコード生成
        $('#qrDisplay').empty().qrcode({
            width: 256,
            height: 256,
            text: sjisStr
        });
        
        // QRコードの下に説明を追加
        $('#qrDisplay').append('<p class="qr-description">Excel形式：タブ区切りCSV（Excelに貼り付け可能）</p>');
    }
    
    // ウィンドウサイズ変更時にもスクロール位置を調整
    $(window).on('resize', function() {
        if (currentQuestionIndex > 0) {
            // 現在の質問のオプションが見えるようにスクロール
            const currentSelector = `.options[data-question-id="${questions[currentFormType][Math.min(currentQuestionIndex, questions[currentFormType].length - 1)].id}"]`;
            const currentElement = document.querySelector(currentSelector);
            if (currentElement) {
                scrollToLatestContent(currentElement);
            }
        }
    });
    
    // フォーム名を取得する関数
    function getFormTitle(form) {
        switch (form) {
            case 'ipss': return 'IPSS-QOLスコア';
            case 'eq5d': return 'EQ-5D';
            case 'epic': return 'EPIC（前立腺癌QOL）';
            default: return '';
        }
    }

    function getDocCode(form) {
        switch (form) {
            case 'ipss': return 'IPSS';
            case 'eq5d': return 'EQ5D';
            case 'epic': return 'EPIC';
            default: return '';
        }
    }

    // PSA値の入力内容を文字列に変換する関数
    function generatePsaText() {
        let psaText = '【PSA検査値】\r\n';
        let hasData = false;
        
        // 3回分のPSA値をチェック
        for (let i = 1; i <= 3; i++) {
            const date = $(`#psaDate${i}`).val();
            const value = $(`#psaValue${i}`).val();
            
            if (date && value) {
                hasData = true;
                psaText += `${date}：${value} ng/mL\r\n`;
            }
        }
        
        return hasData ? psaText : '';
    }

    // PSA入力フォームの送信処理
    $(document).on('click', '#psaSubmitButton', function() {
        // 診察券番号を取得して処理
        let patientId = $('#psaPatientId').val().trim();
        
        // 入力がない場合、URLパラメータから取得を試みる
        if (!patientId) {
            patientId = getPatientIdFromUrl();
        }
        
        // それでも診察券番号が入力されていない場合はアラート表示
        if (!patientId) {
            alert('診察券番号を入力してください');
            $('#psaPatientId').focus();
            return;
        }
        
        // 冒頭の0や途中のハイフンを削除
        const cleanedPatientId = patientId.replace(/^0+|[-]/g, '');
        
        // フォーマットされたテキストを生成
        const formattedText = generateFormattedText(answers);
        
        // PSA値の入力内容を追加
        const psaText = generatePsaText();
        
        // テンプレートIDを取得（現在は固定値）
        const templateId = "template001";
        
        // メール本文を作成
        let mailBody = "このまま件名・内容を変更せずご送信ください\n\n";
        
        // 現在の日付を取得
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        // 診察券番号と日付を先頭に追加
        mailBody += `入力日：${dateString}\n`;
        mailBody += `診察券番号：${cleanedPatientId}\n\n`;
        
        // 問診結果とPSA値を追加
        mailBody += formattedText + psaText;
        
        // メールクライアントを開く
        window.location.href = `mailto:rt.questionnaire@gmail.com?subject=問診結果_${templateId}&body=${encodeURIComponent(mailBody)}`;
    });
});
