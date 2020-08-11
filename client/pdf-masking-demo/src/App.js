import React from 'react';
import './App.css';
import {Document, Page, pdfjs} from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

class App extends React.Component {

    static VAULT_ID = process.env.REACT_APP_VAULT_ID;

    constructor(props) {
        super(props);
        this.state = {
            inputFileBinary: null,
            encodedFile: null,
            loading: false,
            pdfState: "RAW"
        }

    }

    handleFileUpload = async (event) => {
        this.setState({loading: true})
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = (evt) => {
            if (evt.target.readyState === FileReader.DONE) {
                var arrayBuffer = evt.target.result;
                this.setState({
                    inputFileBinary: new Uint8Array(arrayBuffer),
                    loading: false
                });
            }
        };
    }

    handleFormSubmit = async () => {
        this.setState({loading: true})
        let endpoint = this.state.pdfState === "REDACTED" ? "reveal" : "redact";
        let resp = await fetch("https://" + App.VAULT_ID + ".sandbox.verygoodproxy.com/" + endpoint, {
            method: "POST",
            headers: {
                "Content-type": "application/pdf"
            },
            body: this.state.inputFileBinary
        });
        resp = await resp.arrayBuffer();
        let respBytes = new Uint8Array(resp);
        let encodedFile = btoa(respBytes);
        let pdfAsDataUri = "data:application/pdf;base64," + encodedFile;
        this.setState({
            loading: false,
            inputFileBinary: resp,
            inputFile: pdfAsDataUri,
            pdfState: this.state.pdfState === "RAW" ? "REDACTED": "RAW"
        });
    };

    getButtonText = () => {
        return this.state.pdfState === "REDACTED" ? "Reveal" : "Redact";
    }

    getPdfView = () => {
        if (this.state.inputFileBinary === null) {
            return null;
        } else {
            return <Document file={{data: this.state.inputFileBinary}}>
                <Page pageNumber={1} width={600}/>
            </Document>;
        }
    }
    render() {
        if (this.state.loading) {
            return <p>Loading</p>
        } else {
            return <div>
                <div className="container">
                    <div className="col-md-6 mx-auto text-center">
                        <div className="header-title">
                            <h1 className="wv-heading--title">
                                VGS Token Generator
                            </h1>
                            <h2 className="wv-heading--subtitle">
                            </h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mx-auto">
                            <div className="myform form ">
                                <form onSubmit={this.handleFormSubmit}>
                                    <div className="form-group">
                                        <input type="file" name="file" className="form-control my-input"
                                               onChange={this.handleFileUpload}/>
                                    </div>
                                    <div className="text-center ">
                                        <button type="submit" className=" btn btn-block send-button tx-tfm">{this.getButtonText()}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div>
                        {this.getPdfView()}
                    </div>
                </div>
            </div>
        }
    }
}

export default App;
