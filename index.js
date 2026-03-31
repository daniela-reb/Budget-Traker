const saved =localStorage.getItem("spesa");
let desc = document.getElementById('desc');
let amount = document.getElementById('amount');
const btn = document.getElementById('add-btn');
const lista = document.getElementById('lista');
const totaleEl = document.getElementById('totale');

let totale=0;
let spesa = [];
let editId = null;
let chart;//per il grafico

const aggiornaGrafico = () =>{

    let entrate = 0;
    let uscite =0;

    spesa.forEach(item => {
        if(item.type === "entrata") {
            entrate += item.amount;
        } else {
            uscite += item.amount;
        }
    });

    const ctx = document.getElementById('grafico').getContext('2d');

    const gradienGreen = ctx.createLinearGradient(0, 0, 0, 300);
    gradienGreen.addColorStop(0,"#4ade80");
    gradienGreen.addColorStop(1,"#166534");

    const gradientRed = ctx.createLinearGradient(0, 0, 0, 300);
    gradientRed.addColorStop(0, "#f87171");
    gradientRed.addColorStop(1, "#7f1d1d");

    if(chart){
        chart.destroy();
    }

    const centerText = {
        id:"centerTExt",
        beforeDraw(chart) {
            const {width} = chart;
            const {height} = chart;
            const ctx = chart.ctx;

            ctx.restore();

            const fontSize = (height/100).toFixed(2);
            ctx.font = fontSize + "em sans-serif";
            ctx.textBaseline = "middle";

            const text= totale + " €";
            const textX = Math.round((width - ctx.measureText(text).width) / 2);
            const textY = height / 2;

            ctx.fillStyle = totale >= 0 ? "#22c55e" : "#ef4444";
            ctx.fillText(text, textX, textY);

            ctx.save();
        }
    };

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Entrate", "Uscite"],
            datasets: [{
                label: "Totale",
                data: [entrate, uscite],
                backgroundColor: [gradienGreen, gradientRed],
                borderWidth:0,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                   legend: {
                           display:false,
                         }
                    }
            },
         plugins: [centerText]   
    });

    
  
}
const addItem = (item) => {
       
    const tr = document.createElement('tr');
    tr.addEventListener("dblclick", () => {
        
        desc.value= item.desc;
        amount.value = item.amount;
        document.getElementById('type').value = item.type;

       editId = item.id;
    });

    const tdDesc = document.createElement('td');
    tdDesc.innerHTML = `
    <div class = "desc"> ${item.desc}</div>
    <div class = "date"> ${item.date}</div>
    `;  
   

    const tdAmount = document.createElement('td');
    tdAmount.textContent = (item.type === "entrata" ? "+" : "-") + item.amount + " €";
    tdAmount.classList.add(item.type);

 

    const tdDelete = document.createElement('td');
    const btnDelete = document.createElement('button');
    btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnDelete.classList.add('btn-delete');


    btnDelete.addEventListener("click", () => {

        if(item.type === "entrata"){
            totale -=item.amount;
        } else {
            totale += item.amount;
        }

        spesa = spesa.filter(el => el.id !== item.id);
        localStorage.setItem("spesa", JSON.stringify(spesa));

        aggiornaGrafico();

        totaleEl.textContent = totale + " €";
        tr.remove();
    });

    tdDelete.classList.add('elimina');
    tdDelete.appendChild(btnDelete);

    if(item.type === "entrata"){
        totale +=item.amount;
    } else{
        totale -= item.amount;
    }

   totaleEl.classList.remove('entrata', 'uscita');
    if(totale >= 0){
        totaleEl.classList.add('entrata');
    } else {
        totaleEl.classList.add('uscita');
    }

   totaleEl.textContent = totale+ " €";
    tr.appendChild(tdDesc);
    tr.appendChild(tdAmount);
   
    tr.appendChild(tdDelete);
   lista.appendChild(tr);
    
};

btn.addEventListener('click', ()=>{
       
     const type = document.getElementById('type').value;
     const valore= Number(amount.value);

    if(!desc.value || ! amount.value) return;
 
     if(editId !== null){
        spesa = spesa.map(el => {
            if(el.id === editId) {
                return {
                    id: el.id,
                    desc: desc.value,
                    amount: valore,
                    type:type
                };
            }
            return el;
        });
        editId = null;
        lista.innerHTML = "";
        totale = 0;
        spesa.forEach(item => addItem(item));
     } else {
     const item = {
        id: Date.now(),
        desc:desc.value,
        amount: valore,
        type:type,
        date: new Date().toLocaleString()
       };

   addItem(item);
   spesa.push(item);
    }

   localStorage.setItem("spesa", JSON.stringify(spesa));
   aggiornaGrafico();

    desc.value="";
    amount.value="";
    });

if(saved) {
    spesa = JSON.parse(saved);

    spesa.forEach(element => addItem(element));

    aggiornaGrafico();
}

