angular.module('starter.controllers', [])

        .controller('SignInCtrl', function ($scope, $rootScope, $state, $ionicHistory, Auth, UserData, $firebase) {

            $scope.hideBackButton = true;
    
            /* FOR DEV PURPOSES */
            $scope.user = {
                email: "johndoe@gmail.com",
                password: "password"
            };
            
            $scope.signIn = function (user) {
                
                $rootScope.show('Logging In...');
                
                /* Check user fields*/
                if(!user.email || !user.password){
                    $rootScope.hide();
                    $rootScope.notify('Error','Email or Password is incorrect!');
                    return;
                }

                /* All good, let's authentify */
                Auth.$authWithPassword({
                    email    : user.email,
                    password : user.password
                }).then(function (authData) {
                    console.log(authData);
                    $rootScope.hide();
                }).catch(function (error) {
                    $rootScope.hide();
                    $rootScope.notify('Error','Email or Password is incorrect!');
                });
            };

        })

        .controller('RegisterCtrl', function ($scope, $rootScope, $state, $firebase, fireBaseData, UserData, $firebaseAuth) {
            $scope.hideBackButton = true;
            
            /* FOR DEV PURPOSES */            
            $scope.user = {
                firstname: "",
                surname: "",
                email: "",
                password: ""
            };
            
            
            $scope.createUser = function (user) {
                var firstname = user.firstname;
                var surname = user.surname;
                var email = user.email;
                var password = user.password;

                if (!firstname || !surname || !email || !password) {
                    $rootScope.notify("Please enter valid credentials");
                    return false;
                }

                $rootScope.show('Registering...');
                
                var auth = $firebaseAuth(fb);
                auth.$createUser(email, password).then(function (error) {
                    console.log("User created successfully!");
                    return auth.$authWithPassword({
                        email: email,
                        password: password
                    });
                }).then(function (authData) {
                    
                    /* PREPARE DATA FOR FIREBASE*/
                    $scope.temp = {
                        firstname: user.firstname,
                        surname: user.surname,
                        email: user.email,
                        created: Date.now(),
                        updated: Date.now()
                    }
                    
                    /* SAVE PROFILE DATA */
                    var usersRef = UserData.ref();
                    var myUser = usersRef.child(escapeEmailAddress(user.email));
                    myUser.update($scope.temp, function( ret ){
                        console.log(ret);
                        $rootScope.hide();
                        $state.go('housechoice'); 
                    });  
                }).catch(function (error) {
                    if (error.code == 'INVALID_EMAIL') {
                        $rootScope.hide();
                        $rootScope.notify('Error','Invalid Email.');
                    }
                    else if (error.code == 'EMAIL_TAKEN') {
                        $rootScope.hide();
                        $rootScope.notify('Error','Email already taken.');
                    }
                    else {
                        $rootScope.hide();
                        $rootScope.notify('Error','Oops. Something went wrong.');
                    }
                });
            };
        })

        .controller('IntroductionCtrl', function ($scope, $state, $ionicHistory) {
            $ionicHistory.clearHistory();
            $scope.hideBackButton = true;
            
            $scope.registerHouse = function (user) {
                $state.go('register-house');
            };
            $scope.joinHouse = function (user) {
                $state.go('join-house');
            };
        })

        .controller('HouseChoiceCtrl', function ($scope,$rootScope, $state) {
            $rootScope.hide();
        })
        
        .controller('JoinHouseCtrl', function ($scope, $state) {
            
        })

        .controller('RegisterHouseCtrl', function ($scope, $state, $ionicHistory, $firebase, $rootScope, UserData, HouseData) {
            
            /* FOR DEV PURPOSES */
            $scope.house = {
                name: "Crunchy Town",
                currency: "AUD"
            };
            
            $scope.createHouse = function (house) {
                
                $rootScope.show('Creating...');
                var house_name = house.name;
                var house_currency = house.currency;
                
                /* VERIFY USER FIELD */
                if(!house_name || !house_currency){
                    $rootScope.hide();
                    $rootScope.alertPopup('Error','Please fill in the fields correctly');
                    return;
                }
                
                /* PREPARE DATA */
                $scope.temp = {
                    name: house_name,
                    currency: house_currency,
                    admin: $rootScope.authData.password.email,
                    created: Date.now(),
                    updated: Date.now(),
                    join_code: HouseData.randomHouseCode()
                };
                
                /* SAVE HOUSE DATA */
                var myHouses = HouseData.ref();
                var sync = $firebase(myHouses);
                sync.$push($scope.temp).then(function(newChildRef) {
    
                    /* UPDATE USER WITH THE HOUSE ID */
                    $scope.temp = {
                        houseid: newChildRef.key()
                    };
                    
                    /* SAVE PROFILE DATA */
                    var usersRef = UserData.ref();
                    var myUser = usersRef.child(escapeEmailAddress($rootScope.authData.password.email));
                    myUser.update($scope.temp, function(){
                        $rootScope.hide();
                        $state.go('tabs.dashboard'); 
                    }); 
                    myUser.setPriority(newChildRef.key());
                });

            };
            
        })

        .controller('JoinHouseCtrl', function ($scope, $state, $ionicHistory, HouseData,UserData,$rootScope) {
            
            $scope.code = 86105966;
    
            $scope.joinHouse = function(code){
                if(code){
                    HouseData.getHouseByCode(code).then(function (value) {
                        if(value){
                            $scope.temp = {
                                houseid: value
                            }
                            /* SAVE PROFILE DATA */
                            var usersRef = UserData.ref();
                            var myUser = usersRef.child(escapeEmailAddress($rootScope.authData.password.email));
                            myUser.update($scope.temp, function(){
                                $rootScope.hide();
                                $state.go('tabs.dashboard'); 
                            }); 
                            myUser.setPriority(value);
                        }
                    });
                }
            };
            
            
        })
        
        .controller('AddMemberCtrl', function ($scope,$rootScope, $state, $ionicHistory, fireBaseData) {
            
            $scope.isadmin = false;
            if(!fireBaseData.currentData){
                $rootScope.show('Updating...');
                fireBaseData.checkAuth().then(function (authData) {
                    return fireBaseData.refreshData(authData.password.email);  
                }).then( function(output){
                    fireBaseData.currentData = output;
                    $scope.members = $rootScope.members;
                    $scope.isadmin = fireBaseData.currentData.isadmin;
                    $rootScope.hide();
                    console.log(fireBaseData.currentData);
                });
            }else{
                $scope.currentUser = fireBaseData.currentData.currentUser;
                $scope.currentHouse = fireBaseData.currentData.currentHouse;
                $scope.isadmin = fireBaseData.currentData.isadmin;
            }
            
            $scope.email = "johndoe@gmail.com";
            
            $scope.addamember = function(email){
                $rootScope.show('Adding...');
                
                $scope.temp = {
                    email: email,
                    houseid: fireBaseData.currentData.currentUser.houseid
                };
                
                fireBaseData.checkDuplicateEmail(email).then(function(greeting) {
                    var usersRef = fireBaseData.refRoomMates();
                    var myUser = usersRef.child(escapeEmailAddress(email));
                    myUser.update($scope.temp, function(){
                        $rootScope.hide();
                        $state.go('tabs.dashboard'); 
                    });
                }, function(reason) {
                    if(reason === 'EMAIL EXIST'){
                        $rootScope.hide();
                        $rootScope.notify('Error','Email already exists!');
                    }
                });
            };
        })

        .controller('DashboardCtrl', function ($scope, $state, $rootScope, fireBaseData) {

            $scope.$on('$ionicView.enter', function(){
                $rootScope.show('Updating...');
                fireBaseData.refreshData().then(function (output) {
                    fireBaseData.currentData = output;
                    $rootScope.currentUser = fireBaseData.currentData.currentUser;
                    $rootScope.currentHouse = fireBaseData.currentData.currentHouse;
                    $rootScope.isadmin = fireBaseData.currentData.isadmin;
                    $rootScope.hide();
                    console.log(fireBaseData.currentData);
                });
            });
            
            $scope.addamember = function () {
                $state.go('addmember'); 
            };
        })

        .controller('ExpensesCtrl', function ($scope, $rootScope, ExpensesData, fireBaseData, $ionicModal) {
            
            $scope.$on('$ionicView.enter', function(){
                $rootScope.show('');
                ExpensesData.getExpenses(fireBaseData.currentData.currentHouse.id).then(function(expenses){
                    $scope.expenses = expenses;
                    $rootScope.hide();
                });
            });

            $scope.getExpenses = function (filter) {
                console.log(filter);
            };
            
            $ionicModal.fromTemplateUrl('templates/new-expense.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
  
            $scope.newExpense = function () {
                $scope.modal.show();
            };
            
            $scope.cancelModal = function() {
                $scope.modal.hide();
            };
            
            $scope.doRefresh = function() {
                $rootScope.show('');
                ExpensesData.getExpenses().then( function(output){
                    $rootScope.hide();
                    $scope.expense = output;
                    $scope.$broadcast('scroll.refreshComplete');
                });  
            };  
            
            $scope.addExpense = function(expense) {
                
                var amount = expense.amount;
                var purpose = expense.purpose;
                
                $rootScope.show('Adding...');
                
                if(!purpose || !amount){
                    $rootScope.hide();
                    $rootScope.alertPopup('Error','Please fill in the fields correctly');
                    return;
                }
                
                /* PREPARE DATA */
                var temp = {
                    amount: amount,
                    purpose: purpose,
                    user: $rootScope.authData.password.email,
                    created: Date.now(),
                    updated: Date.now()
                };
                
                ExpensesData.addExpense(temp, fireBaseData.currentData.currentHouse.id).then(function () {
                    $rootScope.hide();
                    $scope.modal.hide();
                }); 
            };
        })
        
        .controller('MembersCtrl', function ($scope, $rootScope, UserData, fireBaseData) {
            
            $scope.$on('$ionicView.enter', function(){
                $rootScope.show('');
                UserData.getRoomMates(fireBaseData.currentData.currentHouse.id).then( function(output){
                    $rootScope.hide();
                    $scope.members = output;
                });
            });
            
            $scope.doRefresh = function() {
                $rootScope.show('');
                UserData.getRoomMates(fireBaseData.currentData.currentHouse.id).then( function(output){
                    $rootScope.hide();
                    $scope.members = output;
                    $scope.$broadcast('scroll.refreshComplete');
                });  
            };  
            
        })
        
        .controller('ExpenseDetailCtrl', function ($scope, expense) {
            $scope.expense = expense;
        })
        
        .controller('MembersDetailCtrl', function ($scope, $rootScope, $stateParams, UserData, member) {
            $scope.member = member;
        })

        .controller('SettingsCtrl', function ($scope, $rootScope, $state, $translate, fireBaseData, $ionicHistory, Auth, UserData) {

            /* LOGOUT BUTTON */
            $scope.logout = function () {
                $rootScope.show('');
                fireBaseData.clearData();
                $ionicHistory.clearCache();
                Auth.$unauth();
            };
            
            $scope.quitHouse = function () {
                /* UPDATE USER WITH THE HOUSE ID */
                $scope.temp = {
                    houseid: null
                };

                /* UPDATE PROFILE DATA */
                var usersRef = UserData.ref();
                var myUser = usersRef.child(escapeEmailAddress($rootScope.authData.password.email));
                myUser.update($scope.temp, function(){
                    fireBaseData.clearData();
                    $ionicHistory.clearCache();
                    $rootScope.currentUser = null;
                    $rootScope.currentHouse = null;
                    $state.go('housechoice'); 
                }); 
            };
            
            /* SETTINGS LANGUAGES */
            $scope.languages = $rootScope.settings.languages;
            $scope.selectLanguage = $rootScope.settings.languages[0];
            $scope.updateLanguage = function (language) {
                $translate.use(language.prefix);
            };  
        })
        
        .filter('reverse', function () {
            return function (items) {
                return items.slice().reverse();
            };
        });

function escapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
}

function unescapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\,/g, '.');
    return email;
}

