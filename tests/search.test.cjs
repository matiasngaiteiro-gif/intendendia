const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const fields={searchInput:{value:''},statusFilter:{value:''},buildingFilter:{value:''},specialtyFilter:{value:''},ordersCount:{},ordersTable:{}};
const context=vm.createContext({Date,Intl,structuredClone,console,document:{querySelector:selector=>fields[selector.slice(1)],querySelectorAll:()=>[]}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').replace(/bootstrap\(\);\s*$/,''),context);
vm.runInContext("state={people:[],orders:[{id:'OT-1',title:'Arreglo',description:'Revisión de cañería',dependency:'Juzgado 30',location:'Puerta 14',category:'Sanitarios',building:'Edificio 2',specialty:'Plomería',priority:'Media',status:'Pendiente',dueDate:''}]}",context);
for(const query of ['revision','caneria','juzgado 30','puerta 14','edificio 2']){fields.searchInput.value=query;context.renderOrders();assert.equal(fields.ordersCount.textContent,'1 resultado')}
fields.searchInput.value='inexistente';context.renderOrders();assert.equal(fields.ordersCount.textContent,'0 resultados');
fields.searchInput.value='';fields.specialtyFilter.value='Plomería';context.renderOrders();assert.equal(fields.ordersCount.textContent,'1 resultado');
console.log('7 pruebas del buscador y especialidad: OK');
