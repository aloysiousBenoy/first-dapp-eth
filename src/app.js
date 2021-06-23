App = {
    loading: false,
    contracts: {},

    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
            
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed

            } catch (error) {
                window.alert("cannot proceed without wallet access.")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed

        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        web3.eth.defaultAccount = web3.eth.accounts[0];
        console.log(`Account loaded `);
    },

    loadContract: async () => {
        const contract = await $.getJSON("Todolist.json");
        App.contracts.Todolist = TruffleContract(contract);
        App.contracts.Todolist.setProvider(App.web3Provider);
        App.todolist = await App.contracts.Todolist.deployed();
        console.log("Contract loading complete");
    },

    render: async () => {
        if (App.loading) {
            return;
        }

        App.setLoading(true);

        $('#account').html(App.account);

        await App.renderTasks();

        App.setLoading(false);
    },

    setLoading: (isLoading) => {
        App.loading = isLoading;
        const loader = $('#loader');
        const content = $('#content');
        if (isLoading) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    },

    renderTasks: async () => {
        const taskCount = await App.todolist.taskCount();
        const $taskTemplate = $('.taskTemplate');

        for (let i = 1; i <= taskCount; i++) {
            const task = await App.todolist.tasks(i);
            const taskId = task[0].toNumber();
            const content = task[1];
            const completed = task[2];

            const $newTaskTemplate = $taskTemplate.clone();
            $newTaskTemplate.find('.content').html(content);
            $newTaskTemplate.find('input')
                            .prop('name', taskId)
                            .prop('checked', completed)
                            .on('click', App.toggleCompleted);
            if(completed){
                $('#completedTaskList').append($newTaskTemplate);
            }else{
                $('#taskList').append($newTaskTemplate); 
            }
            $newTaskTemplate.show();

        }
    },

    toggleCompleted: async(e)=>{
        App.setLoading(true);
        const id = e.target.name;
        await App.todolist.toggleTask(id);
        window.location.reload();
    },

    createTask: async()=>{
        App.setLoading(true);
        const content = $('#newTask').val();
        await App.todolist.createTask(content);
        window.location.reload();
    },


}

$(() => {
    $(window).load(() => {
      App.load()
    })
  })