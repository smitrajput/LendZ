// import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import React, { Component } from 'react';
import { Form,Button,Input,Message,Header,Icon } from 'semantic-ui-react'
// import Layout from '../../components/Layout.js';
// import factory from '../../ethereum/factory';
// import web3 from '../../ethereum/web3';
// import { Router } from '../../routes';

// type MyProps = { };
// type MyState = { title: string,
// 				 contract_details:string };

class Contract extends Component{
	constructor(props){
		super(props);
		this.state ={
			title:'',
			contract_details:''
		};
	}


	getContractDetails(){
		console.log("this is contract. hurray");
		fetch('https://jsonplaceholder.typicode.com/todos/1')
		.then(response => response.json())
		.then(json => {
			console.log(json);
			this.setState({contract_details:JSON.stringify(json)})
		})
	}
	// onSubmit = async (event) => {
	// 	event.preventDefault();

	// 	this.setState({loading: true, errorMessage:''});

	// 	try{
	// 		const accounts = await web3.eth.getAccounts();
	// 		await factory.methods.createCampaign(this.state.chooseCategory, this.state.title,
	// 																	this.state.minimumContribution, this.state.description)
	// 			.send({
	// 			from: accounts[0]
	// 		});

	// 		Router.pushRoute('/');
	// 	} catch(err){
	// 		this.setState({ errorMessage: err.message });
	// 	}

	// 	this.setState({loading:false});
	// };

	render(){
		return(

			<div>

				<p>this is my div</p>
				{/* <p>{this.state.title}</p>
				<input value={this.state.title} onChange={(e)=>this.setState({title:e.target.value})} ></input>
				<br></br>
				<button onClick={this.getContractDetails}> get Contract Details </button>
				<p>{this.state.contract_details}</p> */}
				</div>
			//  </Layout>
		);
	}
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    marginTop: theme.spacing(3),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
}));

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];


export  function DenseTable() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Dessert (100g serving)</TableCell>
              <TableCell align="right">Calories</TableCell>
              <TableCell align="right">Fat&nbsp;(g)</TableCell>
              <TableCell align="right">Carbs&nbsp;(g)</TableCell>
              <TableCell align="right">Protein&nbsp;(g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
}

export default Contract;